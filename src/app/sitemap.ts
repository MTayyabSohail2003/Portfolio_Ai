import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mubeen.ai"; // Replace with actual domain

  // Static pages
  const routes = [
    "",
    "/about",
    "/experience",
    "/projects",
    "/skills",
    "/blog",
    "/contact",
    "/chat",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // In real app, fetch dynamic blog slugs here
  // const posts = await getBlogPosts();
  // const blogRoutes = posts.map(...)

  return [...routes];
}
