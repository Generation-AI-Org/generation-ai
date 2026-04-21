import { ImageResponse } from "next/og";

export const alt = "Generation AI — KI-Community für Studierende";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#141414",
          padding: "80px 96px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          color: "#F6F6F6",
        }}
      >
        {/* Kommentar-Zeile (Brand Voice) */}
        <div
          style={{
            fontSize: 28,
            color: "#8A8A8A",
            marginBottom: 28,
            letterSpacing: "-0.01em",
          }}
        >
          // KI-Community für Studierende im DACH-Raum
        </div>

        {/* Claim */}
        <div
          style={{
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            color: "#F6F6F6",
            display: "flex",
            alignItems: "center",
          }}
        >
          Generation AI
          <span
            style={{
              color: "#CEFF32",
              marginLeft: 12,
            }}
          >
            .
          </span>
        </div>

        {/* Footer-Leiste */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 24,
            color: "#8A8A8A",
            gap: 32,
          }}
        >
          <span>generation-ai.org</span>
          <span style={{ color: "#CEFF32" }}>kostenlos · für Studierende</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
