import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const externalPackages = [
  "pdf-parse",
  "pdfkit",
  "mammoth",
  "word-extractor",
];

function nextMajorVersion() {
  const path = join(__dirname, "node_modules", "next", "package.json");
  if (!existsSync(path)) {
    return 14;
  }
  const v = JSON.parse(readFileSync(path, "utf8")).version;
  return parseInt(String(v).split(".")[0], 10) || 14;
}

const major = nextMajorVersion();

/** @type {import('next').NextConfig} */
const nextConfig =
  major >= 15
    ? {
        // Next.js 15+ (moved from experimental.serverComponentsExternalPackages)
        serverExternalPackages: externalPackages,
      }
    : {
        experimental: {
          // Next.js 14: keep native deps out of the server bundle (required for `pdf-parse`)
          serverComponentsExternalPackages: externalPackages,
        },
      };

export default nextConfig;
