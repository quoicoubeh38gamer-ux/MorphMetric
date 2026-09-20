import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MorphMetric — Understand your morphology. Build your potential.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The mark, inlined as a data URI. Satori renders SVG through <img>, and this
// keeps the share card on the same artwork as the favicon and the navbar.
const MARK_PATH =
  "M10 34.5 11.6 15.8c.2-1.9 2.6-2.5 3.7-1L24 30.5l8.7-15.7c1.1-1.5 3.5-.9 3.7 1L38 34.5";
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#0a0b0f"/><svg x="9" y="9" width="30" height="30" viewBox="7 7.65 34 34"><path d="${MARK_PATH}" fill="none" stroke="#f4f5f8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></svg>`;
const markUri = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 80px",
          // The angelic palette. Satori rejects the `background` shorthand when
          // it carries both a gradient and a colour — they go separately.
          backgroundColor: "#f9fafc",
          backgroundImage:
            "radial-gradient(1100px 700px at 50% -12%, #eef0fa 0%, #f9fafc 62%)",
          color: "#12131a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markUri} width={96} height={96} alt="" />
          <div style={{ display: "flex", fontSize: 40, letterSpacing: "-0.02em" }}>MorphMetric</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 1.04, letterSpacing: "-0.035em" }}>
            Understand your morphology.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              color: "#6b6f86",
            }}
          >
            Build your potential.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 27,
            color: "#6b6f86",
          }}
        >
          <div style={{ display: "flex" }}>Measured on-device</div>
          <div style={{ display: "flex", color: "#c3c7d4" }}>·</div>
          <div style={{ display: "flex" }}>Scored on the server</div>
          <div style={{ display: "flex", color: "#c3c7d4" }}>·</div>
          <div style={{ display: "flex" }}>Evidence-tagged guidance</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
