/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /** Keep binary parsers external for App Router / Route Handlers (Next 14). */
    serverComponentsExternalPackages: [
      "pdf-parse",
      "pdfkit",
      "mammoth",
      "word-extractor",
    ],
  },
};

export default nextConfig;
