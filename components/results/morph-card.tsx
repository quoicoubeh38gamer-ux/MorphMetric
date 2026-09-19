"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import type { FaceReport } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { score1 } from "@/lib/utils/format";

// Draws a square social card on a canvas and shares (Web Share) or downloads it.
export function MorphCard({ report }: { report: FaceReport }) {
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const W = 1080;
      const H = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0b0f17");
      bg.addColorStop(1, "#131022");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const blob = (x: number, y: number, r: number, color: string) => {
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, color);
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      blob(220, 200, 460, "rgba(139,124,255,0.28)");
      blob(900, 820, 500, "rgba(52,211,153,0.16)");

      const font = (w: number, size: number) => `${w} ${size}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = "#e7ecf5";
      ctx.font = font(600, 46);
      ctx.fillText("MorphMetric", 80, 130);

      ctx.fillStyle = "#9aa6bd";
      ctx.font = font(600, 30);
      ctx.fillText("YOUR MORPHMETRIC", 80, 330);

      ctx.fillStyle = "#ffffff";
      ctx.font = font(700, 210);
      ctx.fillText(score1(report.morphScore), 74, 520);
      const scoreW = ctx.measureText(score1(report.morphScore)).width;
      ctx.fillStyle = "#9aa6bd";
      ctx.font = font(500, 52);
      ctx.fillText("/ 20", 96 + scoreW, 520);

      // potential
      ctx.fillStyle = "#a78bfa";
      ctx.font = font(600, 36);
      ctx.fillText(`Presentation potential  ${score1(report.potentialScore)} / 20`, 80, 590);

      // strengths
      ctx.fillStyle = "#9aa6bd";
      ctx.font = font(600, 30);
      ctx.fillText("STRENGTHS", 80, 700);
      ctx.font = font(500, 40);
      report.strengths.slice(0, 3).forEach((s, i) => {
        const y = 760 + i * 62;
        ctx.fillStyle = "#e7ecf5";
        ctx.fillText(`${i + 1}.  ${s.label}`, 80, y);
        ctx.fillStyle = "#34d399";
        ctx.font = font(600, 40);
        const label = score1(s.score);
        ctx.fillText(label, W - 80 - ctx.measureText(label).width, y);
        ctx.font = font(500, 40);
      });

      // footer
      ctx.fillStyle = "#7c8aa5";
      ctx.font = font(400, 25);
      ctx.fillText("Internal metric — not a measure of attractiveness or worth.", 80, 1000);
      ctx.fillText("morphmetric · scan · understand · improve", 80, 1035);

      const png: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
      if (!png) return;
      const file = new File([png], "morphmetric.png", { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data?: unknown) => boolean;
        share?: (data?: unknown) => Promise<void>;
      };
      if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "My MorphMetric", text: "My MorphMetric analysis" });
      } else {
        const url = URL.createObjectURL(png);
        const a = document.createElement("a");
        a.href = url;
        a.download = "morphmetric.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user cancelled share or blocked — no-op */
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={generate} disabled={busy}>
      <Share2 className="h-4 w-4" /> {busy ? "Preparing…" : "Share card"}
    </Button>
  );
}
