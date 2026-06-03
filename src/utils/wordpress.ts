import { Work } from "../../types/Work";
import { MediaRef } from "./helpers";
import { UrlSchema } from "@jakubkanna/labguy-front-schema";

type WordPressRendered = {
  rendered?: string;
};

type WordPressMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  caption?: WordPressRendered;
  description?: WordPressRendered;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url?: string; width?: number }>;
  };
};

type WordPressPost = {
  id: number;
  slug: string;
  date?: string;
  modified?: string;
  status?: string;
  title?: WordPressRendered;
  content?: WordPressRendered;
  excerpt?: WordPressRendered;
  acf?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: WordPressMedia[];
  };
};

type WordPressUrlField =
  | string
  | {
      title?: string;
      label?: string;
      url?: string;
      href?: string;
      link?: string | { title?: string; url?: string };
    };

const WORKS_ENDPOINT = "posts";

const hasFieldValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "";

const getField = <T,>(post: WordPressPost, key: string): T | undefined => {
  const acfValue = post.acf?.[key];
  if (hasFieldValue(acfValue)) return acfValue as T;

  const metaValue = post.meta?.[key];
  if (hasFieldValue(metaValue)) return metaValue as T;

  return undefined;
};

const stripTags = (value = "") => value.replace(/<[^>]*>/g, "").trim();

const getTextField = (post: WordPressPost, key: string) => {
  const value = getField<string | number>(post, key);

  if (value === undefined) return undefined;

  const text = String(value).trim();

  return text || undefined;
};

const getYearField = (post: WordPressPost) => {
  const value = getField<string | number>(post, "year");

  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;

  const numericYear = Number(text);

  return Number.isInteger(numericYear) ? numericYear : text;
};

const mapFeaturedMedia = (media?: WordPressMedia): MediaRef[] => {
  if (!media?.source_url) return [];

  return [
    {
      etag: String(media.id || media.source_url),
      mediaType: "IMAGE",
      source_url: media.source_url,
      alt_text: media.alt_text,
      description:
        stripTags(media.caption?.rendered) ||
        stripTags(media.description?.rendered),
      width: media.media_details?.width,
      height: media.media_details?.height,
      media_details: media.media_details,
    },
  ];
};

const normalizeMedia = (post: WordPressPost): MediaRef[] => {
  const acfMedia = getField<MediaRef[]>(post, "media");
  if (Array.isArray(acfMedia) && acfMedia.length > 0) return acfMedia;

  return mapFeaturedMedia(post._embedded?.["wp:featuredmedia"]?.[0]);
};

export const mapWordPressWork = (post: WordPressPost): Work => {
  const title = stripTags(post.title?.rendered) || "Untitled";
  const technique =
    getTextField(post, "technique") || getTextField(post, "medium");
  const description =
    getField<string>(post, "description") ||
    post.content?.rendered ||
    post.excerpt?.rendered ||
    "";

  return {
    id: post.id,
    etag: String(post.id),
    general: {
      title,
      slug: post.slug,
      description: stripTags(description),
      published: !post.status || post.status === "publish",
      createdAt: post.date,
      updatedAt: post.modified,
    },
    description,
    dimensions: getTextField(post, "dimensions"),
    medium: technique,
    technique,
    year: getYearField(post),
    media: normalizeMedia(post),
    urls: getField(post, "urls") || [],
  } as Work;
};

export const mapWordPressPage = (post: WordPressPost | undefined) => ({
  statement: post?.content?.rendered || "",
  additional: [],
  contact: [],
});

const normalizeWordPressUrl = (item: WordPressUrlField): UrlSchema | null => {
  if (typeof item === "string") {
    return item ? ({ title: item, url: item } as UrlSchema) : null;
  }

  const nestedLink = typeof item.link === "object" ? item.link : null;
  const url =
    item.url ||
    item.href ||
    (typeof item.link === "string" ? item.link : undefined) ||
    nestedLink?.url;
  const title = item.title || item.label || nestedLink?.title || url;

  if (!url || !title) return null;

  return { title, url } as UrlSchema;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const parseWordPressAnchors = (value: string): UrlSchema[] => {
  const links: UrlSchema[] = [];
  const anchorPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(value)) !== null) {
    const url = decodeHtmlEntities(match[1].trim());
    const title = decodeHtmlEntities(stripTags(match[2]).trim()) || url;

    if (url) links.push({ title, url } as UrlSchema);
  }

  return links;
};

const parseWordPressUrlText = (value: string): UrlSchema[] => {
  const anchorLinks = parseWordPressAnchors(value);

  if (anchorLinks.length > 0) return anchorLinks;

  const jsonValue = value.trim();

  if (jsonValue.startsWith("[")) {
    try {
      const parsed = JSON.parse(jsonValue) as WordPressUrlField[];

      if (Array.isArray(parsed)) {
        return parsed
          .map(normalizeWordPressUrl)
          .filter((url): url is UrlSchema => Boolean(url));
      }
    } catch {
      // Fall back to line parsing below.
    }
  }

  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...urlParts] = line.split("|").map((part) => part.trim());
      const url = urlParts.join("|");

      if (title && url) return { title, url } as UrlSchema;
      if (/^(https?:\/\/|mailto:|\/)/i.test(line)) {
        return { title: line, url: line } as UrlSchema;
      }

      return null;
    })
    .filter((url): url is UrlSchema => Boolean(url));
};

export const mapWordPressHomePreferences = (post: WordPressPost | undefined) => {
  const homepageUrls = post?.content?.rendered || "";

  return {
    homepage_urls: parseWordPressUrlText(homepageUrls),
  };
};

export const resolveWordPressPath = (path: string) => {
  const [pathname, query = ""] = path.split("?");

  if (pathname === "works") {
    const params = new URLSearchParams(query);
    params.delete("unique");
    params.set("per_page", params.get("per_page") || "100");
    params.set("_embed", "1");
    params.set("acf_format", params.get("acf_format") || "standard");
    return `${WORKS_ENDPOINT}?${params.toString()}`;
  }

  if (pathname.startsWith("works/")) {
    const slug = pathname.replace("works/", "");
    const params = new URLSearchParams({
      slug,
      _embed: "1",
      acf_format: "standard",
    });
    return `${WORKS_ENDPOINT}?${params.toString()}`;
  }

  if (pathname.startsWith("pages/")) {
    const slug = pathname.replace("pages/", "");
    return `pages?slug=${slug}&_embed=1`;
  }

  if (pathname === "home") {
    return "pages?slug=home&_embed=1";
  }

  if (pathname === "general") {
    return `${WORKS_ENDPOINT}?per_page=100&_fields=slug`;
  }

  return path;
};

export const transformWordPressResponse = <T,>(path: string, data: unknown): T => {
  const pathname = path.split("?")[0];

  if (pathname === "works" && Array.isArray(data)) {
    return data.map(mapWordPressWork) as T;
  }

  if (pathname.startsWith("works/") && Array.isArray(data)) {
    return (data[0] ? mapWordPressWork(data[0]) : null) as T;
  }

  if (pathname.startsWith("pages/") && Array.isArray(data)) {
    return mapWordPressPage(data[0]) as T;
  }

  if (pathname === "home" && Array.isArray(data)) {
    return mapWordPressHomePreferences(data[0]) as T;
  }

  if (pathname === "general" && Array.isArray(data)) {
    return data.map((item: WordPressPost) => ({
      slug: item.slug,
      work: true,
    })) as T;
  }

  return data as T;
};
