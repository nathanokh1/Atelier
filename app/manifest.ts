import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CreativePhotoEditor",
    short_name: "PhotoEditor",
    description:
      "A free, browser-first photo editor. Layers, move, resize, blend modes and export — no install, your images never leave your device.",
    start_url: "/editor",
    scope: "/",
    display: "standalone",
    background_color: "#101216",
    theme_color: "#101216",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
