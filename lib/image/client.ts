// Browser-side image pipeline.
//
// In the DB-less MVP the raw photo never leaves the device: we re-encode it
// through a canvas (which strips EXIF/GPS metadata), measure real quality
// signals (resolution, brightness, sharpness), and derive a compact fingerprint
// that is the only thing sent to the server for scoring.

import type { QualitySummary } from "@/lib/ai/types";
import { ACCEPTED_MIME, MAX_UPLOAD_MB } from "@/lib/constants";

export interface ProcessedImage {
  previewDataUrl: string;
  quality: QualitySummary;
  fingerprint: number[];
}

export function validateFile(file: File): string | null {
  if (!(ACCEPTED_MIME as readonly string[]).includes(file.type)) {
    return "Please use a JPG, PNG or WebP image.";
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return `Image must be under ${MAX_UPLOAD_MB} MB.`;
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  return { canvas, ctx };
}

function computeQuality(ctx: CanvasRenderingContext2D, w: number, h: number, origMinDim: number): QualitySummary {
  const { data } = ctx.getImageData(0, 0, w, h);
  const n = w * h;
  const gray = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const lum = 0.299 * (data[p] ?? 0) + 0.587 * (data[p + 1] ?? 0) + 0.114 * (data[p + 2] ?? 0);
    gray[i] = lum;
    sum += lum;
  }
  const mean = sum / n;

  // Laplacian variance → sharpness proxy.
  let lapSum = 0;
  let lapSqSum = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap =
        4 * (gray[i] ?? 0) - (gray[i - 1] ?? 0) - (gray[i + 1] ?? 0) - (gray[i - w] ?? 0) - (gray[i + w] ?? 0);
      lapSum += lap;
      lapSqSum += lap * lap;
      count++;
    }
  }
  const lapMean = count > 0 ? lapSum / count : 0;
  const lapVar = count > 0 ? lapSqSum / count - lapMean * lapMean : 0;

  const issues: string[] = [];
  let score = 1;

  if (origMinDim < 256) {
    issues.push("Resolution is low — use a larger, sharper photo.");
    score -= 0.35;
  }
  if (mean < 45) {
    issues.push("The photo looks too dark — try better lighting.");
    score -= 0.3;
  } else if (mean > 225) {
    issues.push("The photo looks overexposed — reduce harsh light.");
    score -= 0.25;
  }
  if (lapVar < 60) {
    issues.push("The photo looks blurry — hold the camera steady and refocus.");
    score -= 0.3;
  }

  score = Math.max(0, Math.min(1, score));
  return { ok: score >= 0.55, score: Math.round(score * 100) / 100, issues };
}

function computeFingerprint(img: HTMLImageElement): number[] {
  // 8×8 grayscale digest — a stable, low-dimensional, non-reversible summary.
  const size = 8;
  const { ctx } = makeCanvas(size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const fp: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const p = i * 4;
    const lum = 0.299 * (data[p] ?? 0) + 0.587 * (data[p + 1] ?? 0) + 0.114 * (data[p + 2] ?? 0);
    fp.push(Math.round((lum / 255) * 1000) / 1000);
  }
  return fp;
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const img = await loadImage(file);
  const origMinDim = Math.min(img.naturalWidth, img.naturalHeight);

  // Re-encode capped at 512px (strips EXIF, bounds work).
  const maxDim = 512;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const quality = computeQuality(ctx, w, h, origMinDim);
  const fingerprint = computeFingerprint(img);
  const previewDataUrl = canvas.toDataURL("image/jpeg", 0.85);

  return { previewDataUrl, quality, fingerprint };
}
