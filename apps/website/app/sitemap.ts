import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://generation-ai.org";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: `${baseUrl}/test`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
  ];
}
