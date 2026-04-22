import type { MetadataRoute } from "next";

const siteUrl = "https://invinciblecrm.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/contacts", "/deals", "/tasks", "/settings", "/team", "/inbox", "/automations"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
