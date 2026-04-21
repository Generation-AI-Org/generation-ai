import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Generation AI — KI-Community für Studierende";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Inline Brand-Logo SVG als data-URL laden (Satori-friendly)
  const svgPath = join(
    process.cwd(),
    "public",
    "brand",
    "logos",
    "logo-wide-neon-on-blue.svg",
  );
  const svgBuffer = await readFile(svgPath);
  const svgDataUrl = `data:image/svg+xml;base64,${svgBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#3A3AFF",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgDataUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
