import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

// Static routes (no dynamic slugs)
const staticRoutes = [
  "/",
  "/#bio",
  "/#contact",
  "/#works",
  // "/calendar",
  // "/projects",
];

const buildApiUrl = (baseUrl, pathName) => {
  const siteUrl = process.env.WP_SITE_URL || process.env.SITE_URL || process.env.BASE_URL;
  const absoluteBase =
    baseUrl.startsWith("/") && siteUrl
      ? `${siteUrl.replace(/\/+$/g, "")}${baseUrl}`
      : baseUrl;
  const cleanBase = absoluteBase.replace(/\/+$/g, "");
  const cleanPath = pathName.replace(/^\/+|\/+$/g, "");

  return `${cleanBase}/${cleanPath}`;
};

const fetchPostSlugs = async () => {
  const apiUrl = process.env.VITE_SERVER_API_URL;

  if (!apiUrl) {
    throw new Error(
      "VITE_SERVER_API_URL is not defined in environment variables"
    );
  }

  try {
    const endpoint = buildApiUrl(apiUrl, "posts?per_page=100&_fields=slug");

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from ${endpoint}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.map((item) => item.slug);
  } catch (error) {
    console.error("Error fetching slugs:", error);
    return [];
  }
};

// Function to generate the sitemap XML
const generateSitemap = async () => {
  // Get dynamic slugs
  const workSlugs = await fetchPostSlugs();

  // Get the base URL from environment variables
  const baseUrl = process.env.SITE_URL || process.env.BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "SITE_URL or BASE_URL is not defined in environment variables"
    );
  }

  // Start sitemap structure
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticRoutes.forEach((route) => {
    sitemap += `  <url>\n    <loc>${baseUrl}${route}</loc>\n  </url>\n`;
  });

  workSlugs.forEach((slug) => {
    sitemap += `  <url>\n    <loc>${baseUrl}/${slug}</loc>\n  </url>\n`;
  });

  // Close URL set
  sitemap += "</urlset>\n";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputPath =
    process.env.SITEMAP_OUTPUT_PATH ||
    path.join(__dirname, "../../", "public", "sitemap.xml");

  fs.writeFileSync(outputPath, sitemap);
  console.debug("Sitemap generated: " + outputPath);
};

// Call the function to generate the sitemap
generateSitemap();
