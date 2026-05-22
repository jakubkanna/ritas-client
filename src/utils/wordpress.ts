import { Work } from "../../types/Work";
import { MediaRef } from "./helpers";

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

const WORKS_ENDPOINT = "posts";

const getField = <T,>(post: WordPressPost, key: string): T | undefined => {
  const acfValue = post.acf?.[key];
  if (acfValue !== undefined && acfValue !== null) return acfValue as T;

  const metaValue = post.meta?.[key];
  if (metaValue !== undefined && metaValue !== null) return metaValue as T;

  return undefined;
};

const stripTags = (value = "") => value.replace(/<[^>]*>/g, "").trim();

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
      published: post.status === "publish",
      createdAt: post.date,
      updatedAt: post.modified,
    },
    description,
    dimensions: getField<string>(post, "dimensions"),
    medium: getField<string>(post, "medium"),
    year: getField<string | number>(post, "year"),
    media: normalizeMedia(post),
    urls: getField(post, "urls") || [],
  } as Work;
};

export const mapWordPressPage = (post: WordPressPost | undefined) => ({
  statement: post?.content?.rendered || "",
  additional: [],
  contact: [],
});

export const resolveWordPressPath = (path: string) => {
  const [pathname, query = ""] = path.split("?");

  if (pathname === "works") {
    const params = new URLSearchParams(query);
    params.delete("unique");
    params.set("per_page", params.get("per_page") || "100");
    params.set("_embed", "1");
    return `${WORKS_ENDPOINT}?${params.toString()}`;
  }

  if (pathname.startsWith("works/")) {
    const slug = pathname.replace("works/", "");
    const params = new URLSearchParams({
      slug,
      _embed: "1",
    });
    return `${WORKS_ENDPOINT}?${params.toString()}`;
  }

  if (pathname.startsWith("pages/")) {
    const slug = pathname.replace("pages/", "");
    return `pages?slug=${slug}&_embed=1`;
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

  if (pathname === "general" && Array.isArray(data)) {
    return data.map((item: WordPressPost) => ({ slug: item.slug, work: true })) as T;
  }

  return data as T;
};
