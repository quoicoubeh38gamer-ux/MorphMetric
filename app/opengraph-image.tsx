import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MorphMetric — Understand your morphology. Build your potential.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b0f17 0%, #131022 100%)",
          color: "#e7ecf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#a78bfa" }}>MorphMetric</div>
        <div style={{ display: "flex", fontSize: 74, fontWeight: 700, marginTop: 22, lineHeight: 1.05 }}>
          Understand your morphology.
        </div>
        <div style={{ display: "flex", fontSize: 74, fontWeight: 700, color: "#a78bfa", lineHeight: 1.05 }}>
          Build your potential.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9aa6bd", marginTop: 30 }}>
          AI-powered visual analysis · evidence-based guidance
        </div>
      </div>
    ),
    { ...size },
  );
}
