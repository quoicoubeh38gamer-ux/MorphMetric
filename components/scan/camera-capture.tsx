"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Live selfie capture. Opens the front camera, shows a framing oval + guide,
 * and returns a square JPEG File on capture (fed into the same analysis
 * pipeline as an upload). Falls back gracefully to an error message.
 */
export function CameraCapture({
  onCapture,
  onCancel,
}: {
  onCapture: (file: File) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera isn't available in this browser. Upload a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e) {
        const denied = e instanceof DOMException && e.name === "NotAllowedError";
        setError(
          denied
            ? "Camera access was denied. You can upload a photo instead."
            : "Couldn't access the camera. Upload a photo instead.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const size = Math.min(w, h);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
    canvas.toBlob(
      (b) => {
        if (!b) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(new File([b], "capture.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
        <p className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
        <Button variant="secondary" className="mt-3" onClick={onCancel}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
        <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover [transform:scaleX(-1)]" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[72%] w-[56%] rounded-[50%] border-2 border-white/60" />
        </div>
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
          Face in the oval · neutral expression · good light
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
          <Button variant="secondary" onClick={onCancel}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={capture} disabled={!ready}>
            <Camera className="h-4 w-4" /> Capture
          </Button>
        </div>
      </div>
    </div>
  );
}
