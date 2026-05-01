import type { MetadataRoute } from "next";

const siteUrl = "https://invinciblecrm.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/book-demo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/whatsapp-crm`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${siteUrl}/crm-for-small-business`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${siteUrl}/crm-for-indian-sales-teams`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];
}
