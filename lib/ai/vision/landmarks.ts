// Real vision model — MediaPipe FaceLandmarker (468 landmarks), in-browser.
//
// Runs entirely on-device (privacy-first, zero inference cost). It detects a
// face, extracts per-feature "balance" signals from real geometry, samples skin
// evenness from pixels, and renders a mesh overlay for the scan UI. The signals
// are sent to the server, which stays authoritative for scoring.
//
// These signals are proportion-BALANCE heuristics (how close a ratio sits to a
// neutral reference), never a claim of objective beauty. The server attaches
// confidence levels to every feature.

import { FEATURE_KEYS, type FaceMetricsRaw, type FeatureKey } from "../types";
import { clamp01, clampN } from "@/lib/utils/math";

// Load the model lazily from the CDN, matching the installed npm version so the
// WASM runtime and the JS API stay compatible.
const MP_VERSION = "0.10.18";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type Pt = { x: number; y: number; z?: number };

export interface FaceDetectResult {
  detected: boolean;
  signals?: Record<FeatureKey, number>;
  metrics?: FaceMetricsRaw;
  meshPreviewDataUrl?: string;
  pointCount?: number;
  error?: string;
}

// MediaPipe's own types are not installed — the package is fetched from a CDN
// at runtime — so this declares the narrow surface we actually call. It is a
// structural claim about the remote module: keep it minimal so a CDN change
// shows up as a runtime guard hit rather than a silent mismatch.
type DetectResult = { faceLandmarks?: Pt[][] };
type FaceLandmarker = { detect(input: HTMLImageElement | HTMLCanvasElement): DetectResult };
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
  }
  return landmarkerPromise;
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
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Normalised deviation from a reference: 0 on the reference, 1 at the edge of
 * the plausible human range. `tol` is a real anthropometric spread — the
 * previous generous windows accepted essentially every human face, which is
 * why every scan landed in the same three-point band.
 */
const dev = (v: number, ref: number, tol: number) => clamp01(Math.abs(v - ref) / tol);

/**
 * Combine deviations by quadratic mean, so the worst component dominates.
 * A weighted average of independent sub-signals collapses variance toward the
 * middle — the real cause of the compressed scale.
 */
const combine = (...ds: number[]) =>
  clamp01(Math.sqrt(ds.reduce((sum, d) => sum + d * d, 0) / Math.max(1, ds.length)));

/** A feature signal is the complement of its combined deviation. */
const signalFrom = (...ds: number[]) => clamp01(1 - combine(...ds));

// Canonical MediaPipe FaceMesh indices.
const IDX = {
  top: 10,
  chin: 152,
  faceR: 234,
  faceL: 454,
  eyeROut: 33,
  eyeRIn: 133,
  eyeRTop: 159,
  eyeRBot: 145,
  eyeLOut: 263,
  eyeLIn: 362,
  eyeLTop: 386,
  eyeLBot: 374,
  browR: 105,
  browL: 334,
  noseBridge: 168,
  noseBase: 2,
  alaR: 129,
  alaL: 358,
  mouthR: 61,
  mouthL: 291,
  lipTop: 13,
  lipBot: 14,
  lipTopOuter: 0,
  lipBotOuter: 17,
  jawR: 172,
  jawL: 397,
  cheekR: 50,
  cheekL: 280,
} as const;

const SYM_PAIRS: [number, number][] = [
  [IDX.eyeROut, IDX.eyeLOut],
  [IDX.eyeRIn, IDX.eyeLIn],
  [IDX.alaR, IDX.alaL],
  [IDX.mouthR, IDX.mouthL],
  [IDX.faceR, IDX.faceL],
  [IDX.browR, IDX.browL],
  [IDX.jawR, IDX.jawL],
];

function computeSignals(lm: Pt[], skinEvenness: number): Record<FeatureKey, number> {
  const P = (i: number): Pt => lm[i] ?? { x: 0.5, y: 0.5 };
  const faceWidth = Math.max(1e-4, dist(P(IDX.faceR), P(IDX.faceL)));
  const faceHeight = Math.max(1e-4, dist(P(IDX.top), P(IDX.chin)));

  // Symmetry — mirror deviation of paired points about the facial midline.
  const midX = [IDX.top, IDX.noseBridge, IDX.noseBase, IDX.chin].reduce((s, i) => s + P(i).x, 0) / 4;
  let symDev = 0;
  for (const [r, l] of SYM_PAIRS) {
    const pairMidX = (P(r).x + P(l).x) / 2;
    const dx = Math.abs(pairMidX - midX) / faceWidth;
    const dy = Math.abs(P(r).y - P(l).y) / faceHeight;
    symDev += dx + dy;
  }
  symDev /= SYM_PAIRS.length;
  const symmetry = signalFrom(clamp01(symDev / 0.025));

  // Proportions — vertical thirds + horizontal fifths + width/height ratio.
  const browY = (P(IDX.browR).y + P(IDX.browL).y) / 2;
  const t1 = browY - P(IDX.top).y;
  const t2 = P(IDX.noseBase).y - browY;
  const t3 = P(IDX.chin).y - P(IDX.noseBase).y;
  const tSum = Math.max(1e-4, t1 + t2 + t3);
  const thirdsDev = Math.abs(t1 / tSum - 1 / 3) + Math.abs(t2 / tSum - 1 / 3) + Math.abs(t3 / tSum - 1 / 3);
  const dThirds = clamp01(thirdsDev / 0.18);

  const interocular = dist(P(IDX.eyeRIn), P(IDX.eyeLIn));
  const eyeWidth = (dist(P(IDX.eyeROut), P(IDX.eyeRIn)) + dist(P(IDX.eyeLOut), P(IDX.eyeLIn))) / 2 || 1e-4;
  const fifthsRatio = interocular / eyeWidth;
  const dFifths = dev(fifthsRatio, 1, 0.25);
  const whr = faceWidth / faceHeight;
  const dWhr = dev(whr, 0.75, 0.1);
  const proportions = signalFrom(dThirds, dFifths, dWhr);

  // Eyes — aspect ratio + spacing.
  const eaR = dist(P(IDX.eyeRTop), P(IDX.eyeRBot)) / (dist(P(IDX.eyeROut), P(IDX.eyeRIn)) || 1e-4);
  const eaL = dist(P(IDX.eyeLTop), P(IDX.eyeLBot)) / (dist(P(IDX.eyeLOut), P(IDX.eyeLIn)) || 1e-4);
  const eyeAspect = (eaR + eaL) / 2;
  const eyes = signalFrom(dev(eyeAspect, 0.32, 0.09), dFifths);

  // Brows — height above the eye + left/right balance.
  const gapR = (P(IDX.eyeRTop).y - P(IDX.browR).y) / faceHeight;
  const gapL = (P(IDX.eyeLTop).y - P(IDX.browL).y) / faceHeight;
  const browGap = (gapR + gapL) / 2;
  const dBrowBalance = clamp01(Math.abs(gapR - gapL) / 0.02);
  const brows = signalFrom(dev(browGap, 0.06, 0.03), dBrowBalance);

  // Nose — width vs face + length.
  const noseWidth = dist(P(IDX.alaR), P(IDX.alaL)) / faceWidth;
  const noseLen = (P(IDX.noseBase).y - P(IDX.noseBridge).y) / faceHeight;
  const nose = signalFrom(dev(noseWidth, 0.25, 0.06), dev(noseLen, 0.33, 0.08));

  // Lips — mouth width vs face + fullness.
  const mouthWidth = dist(P(IDX.mouthR), P(IDX.mouthL)) / faceWidth;
  const lipHeight = dist(P(IDX.lipTopOuter), P(IDX.lipBotOuter)) / (dist(P(IDX.mouthR), P(IDX.mouthL)) || 1e-4);
  const lips = signalFrom(dev(mouthWidth, 0.46, 0.08), dev(lipHeight, 0.4, 0.16));

  // Jaw / lower face — width vs face + chin height.
  const jawWidth = dist(P(IDX.jawR), P(IDX.jawL)) / faceWidth;
  const chinH = (P(IDX.chin).y - P(IDX.lipBotOuter).y) / faceHeight;
  const jaw = signalFrom(dev(jawWidth, 0.78, 0.1), dev(chinH, 0.19, 0.07));

  return {
    symmetry: round3(symmetry),
    proportions: round3(proportions),
    eyes: round3(eyes),
    brows: round3(brows),
    nose: round3(nose),
    lips: round3(lips),
    jaw: round3(jaw),
    skin: round3(skinEvenness),
  };
}


/** Real geometric sub-metrics from the mesh (formatted client-side numbers). */
function computeMetrics(lm: Pt[]): FaceMetricsRaw {
  const P = (i: number): Pt => lm[i] ?? { x: 0.5, y: 0.5 };
  const faceWidth = Math.max(1e-4, dist(P(IDX.faceR), P(IDX.faceL)));
  const faceHeight = Math.max(1e-4, dist(P(IDX.top), P(IDX.chin)));
  const browY = (P(IDX.browR).y + P(IDX.browL).y) / 2;
  const t1 = browY - P(IDX.top).y;
  const t2 = P(IDX.noseBase).y - browY;
  const t3 = P(IDX.chin).y - P(IDX.noseBase).y;
  const tSum = Math.max(1e-4, t1 + t2 + t3);
  const interocular = dist(P(IDX.eyeRIn), P(IDX.eyeLIn));
  const eyeWidth = (dist(P(IDX.eyeROut), P(IDX.eyeRIn)) + dist(P(IDX.eyeLOut), P(IDX.eyeLIn))) / 2 || 1e-4;
  const upperFaceH = Math.max(1e-4, P(IDX.lipTopOuter).y - browY);

  // canthal tilt (deg), positive = outer corner higher than inner
  const tiltR = Math.atan2(P(IDX.eyeRIn).y - P(IDX.eyeROut).y, Math.max(1e-4, Math.abs(P(IDX.eyeROut).x - P(IDX.eyeRIn).x)));
  const tiltL = Math.atan2(P(IDX.eyeLIn).y - P(IDX.eyeLOut).y, Math.max(1e-4, Math.abs(P(IDX.eyeLOut).x - P(IDX.eyeLIn).x)));
  const canthalTiltDeg = ((tiltR + tiltL) / 2) * (180 / Math.PI);

  const midX = [IDX.top, IDX.noseBridge, IDX.noseBase, IDX.chin].reduce((s, i) => s + P(i).x, 0) / 4;
  let symDev = 0;
  for (const [r, l] of SYM_PAIRS) {
    symDev += Math.abs((P(r).x + P(l).x) / 2 - midX) / faceWidth + Math.abs(P(r).y - P(l).y) / faceHeight;
  }
  symDev /= SYM_PAIRS.length;

  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return {
    thirdsUpper: r3(clampN(t1 / tSum, 0, 1)),
    thirdsMid: r3(clampN(t2 / tSum, 0, 1)),
    thirdsLower: r3(clampN(t3 / tSum, 0, 1)),
    fwhr: r3(clampN(faceWidth / upperFaceH, 0, 5)),
    interocularRatio: r3(clampN(interocular / eyeWidth, 0, 5)),
    canthalTiltDeg: r1(clampN(canthalTiltDeg, -45, 45)),
    jawWidthRatio: r3(clampN(dist(P(IDX.jawR), P(IDX.jawL)) / faceWidth, 0, 3)),
    noseWidthRatio: r3(clampN(dist(P(IDX.alaR), P(IDX.alaL)) / faceWidth, 0, 2)),
    mouthWidthRatio: r3(clampN(dist(P(IDX.mouthR), P(IDX.mouthL)) / faceWidth, 0, 2)),
    symmetryDevPct: r1(clampN(symDev * 100, 0, 100)),
  };
}

/** Sample skin evenness near both cheeks (lower local variance = smoother). */
function skinEvennessFrom(ctx: CanvasRenderingContext2D, lm: Pt[], w: number, h: number): number {
  const centers = [lm[IDX.cheekR], lm[IDX.cheekL]].filter(Boolean) as Pt[];
  if (centers.length === 0) return 0.6;
  const win = Math.max(6, Math.round(Math.min(w, h) * 0.05));
  let varSum = 0;
  let count = 0;
  for (const c of centers) {
    const cx = Math.round(c.x * w);
    const cy = Math.round(c.y * h);
    const x0 = Math.max(0, cx - win);
    const y0 = Math.max(0, cy - win);
    const sw = Math.min(w - x0, win * 2);
    const sh = Math.min(h - y0, win * 2);
    if (sw <= 1 || sh <= 1) continue;
    const { data } = ctx.getImageData(x0, y0, sw, sh);
    const n = sw * sh;
    let sum = 0;
    const lum: number[] = [];
    for (let i = 0; i < n; i++) {
      const p = i * 4;
      const l = 0.299 * (data[p] ?? 0) + 0.587 * (data[p + 1] ?? 0) + 0.114 * (data[p + 2] ?? 0);
      lum.push(l);
      sum += l;
    }
    const mean = sum / n;
    let v = 0;
    for (const l of lum) v += (l - mean) * (l - mean);
    varSum += Math.sqrt(v / n);
    count++;
  }
  if (count === 0) return 0.6;
  const stdev = varSum / count;
  return clamp01(1 - stdev / 42);
}

function drawMesh(img: HTMLImageElement, lm: Pt[]): string {
  const size = 360;
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(150, 190, 255, 0.9)";
  for (const p of lm) {
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export async function detectFace(file: File): Promise<FaceDetectResult> {
  try {
    const img = await loadImage(file);
    const landmarker = await getLandmarker();
    const result = landmarker.detect(img);
    const faces = result?.faceLandmarks;
    if (!faces || faces.length === 0) return { detected: false };
    const lm = faces[0] as Pt[];

    // A degenerate detection can hand back non-finite coordinates. Scoring
    // those produces a confident-looking report built on nothing — and since
    // NaN serialises to null, the server's schema would reject the request
    // with a generic error instead of the honest "we could not read this
    // photo". Treat it as no detection, which is what it is.
    if (!lm.length || lm.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
      return { detected: false, error: "Face landmarks could not be read from this image." };
    }

    // Sample pixels for skin evenness at the image's own resolution (capped).
    const cap = 512;
    const s = Math.min(1, cap / Math.max(img.naturalWidth, img.naturalHeight));
    const cw = Math.max(1, Math.round(img.naturalWidth * s));
    const ch = Math.max(1, Math.round(img.naturalHeight * s));
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const cctx = c.getContext("2d");
    let skin = 0.6;
    if (cctx) {
      cctx.drawImage(img, 0, 0, cw, ch);
      skin = skinEvennessFrom(cctx, lm, cw, ch);
    }

    const signals = computeSignals(lm, skin);
    // Guard against a degenerate detection producing NaNs.
    for (const k of FEATURE_KEYS) {
      if (!Number.isFinite(signals[k])) return { detected: false };
    }

    return {
      detected: true,
      signals,
      metrics: computeMetrics(lm),
      meshPreviewDataUrl: drawMesh(img, lm),
      pointCount: lm.length,
    };
  } catch (e) {
    return { detected: false, error: e instanceof Error ? e.message : "Face detection failed." };
  }
}
