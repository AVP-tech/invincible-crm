import type { MetadataRoute } from "next";

const siteTitle = "Invincible CRM";
const siteDescription =
  "Invincible CRM turns plain-language updates into structured contacts, deals, tasks, and notes before anything is saved.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteTitle,
    short_name: siteTitle,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0f141e",
    theme_color: "#132032",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
