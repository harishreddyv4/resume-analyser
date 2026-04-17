import { ImageResponse } from "next/og";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function loadLogoDataUrl(): Promise<string | undefined> {
  try {
    const res = await fetch(
      new URL("/resume-analyzer-logo.svg", getPublicSiteUrl()),
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) {
      return undefined;
    }
    const buf = await res.arrayBuffer();
    return `data:image/svg+xml;base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return undefined;
  }
}

export default async function OpenGraphImage() {
  const logoSrc = await loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 48,
          background: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
          color: "white",
          padding: 64,
          fontFamily: "Arial",
        }}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            width={140}
            height={164}
            alt=""
            style={{ flexShrink: 0 }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Premium ATS Resume Feedback
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: "#e2e8f0",
              maxWidth: 940,
            }}
          >
            Score clarity, rewrite bullets, and align to your target role.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
