import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CrystalKey — Canadian Mortgage Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#fafafa",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Logo mark */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "48px",
        }}>
          <div style={{
            width: "52px",
            height: "52px",
            background: "#1068A8",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L5 4.5l2.5 3.5L9.5 5l2.5 6H2z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: "28px", fontWeight: 600, color: "#111111", letterSpacing: "-0.5px" }}>
            CrystalKey
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: "68px",
          fontWeight: 600,
          color: "#1068A8",
          lineHeight: 1.1,
          marginBottom: "28px",
          letterSpacing: "-2px",
        }}>
          Canadian Mortgage<br />Calculator
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: "28px",
          color: "#555555",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          marginBottom: "52px",
        }}>
          CMHC · Land Transfer Tax · Amortization · Stress Test
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {["Free", "Accurate", "Built for Canadians", "All provinces"].map((tag) => (
            <div key={tag} style={{
              background: "#eff6ff",
              color: "#1068A8",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "20px",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{
          position: "absolute",
          bottom: "56px",
          right: "80px",
          fontSize: "22px",
          color: "#999999",
          fontFamily: "system-ui, sans-serif",
        }}>
          crystalkey.ca
        </div>
      </div>
    ),
    { ...size },
  );
}
