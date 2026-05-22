import { ImageRefSchema } from "@jakubkanna/labguy-front-schema";

type WordPressImageSize = {
  source_url?: string;
  width?: number;
};

type WordPressImage = ImageRefSchema & {
  url?: string;
  source_url?: string;
  guid?: {
    rendered?: string;
  };
  media_details?: {
    sizes?: Record<string, WordPressImageSize>;
  };
  alt_text?: string;
  caption?: {
    rendered?: string;
  };
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const joinUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/+$/g, "")}/${path.replace(/^\/+/g, "")}`;

const WORDPRESS_UPLOADS_PATH = "wp-content/uploads";

const getWordPressOrigin = () => {
  const apiUrl = import.meta.env.VITE_SERVER_API_URL?.trim();

  if (!apiUrl || !isAbsoluteUrl(apiUrl)) return "";

  return new URL(apiUrl).origin;
};

const resolveMediaUrl = (path?: string | null) => {
  if (!path) return "";
  if (isAbsoluteUrl(path) || path.startsWith("/")) return path;

  return joinUrl(
    getWordPressOrigin()
      ? joinUrl(getWordPressOrigin(), WORDPRESS_UPLOADS_PATH)
      : `/${WORDPRESS_UPLOADS_PATH}`,
    path
  );
};

const getWordPressSrcSet = (image: WordPressImage) => {
  const sizes = image.media_details?.sizes;

  if (!sizes) return "";

  return Object.values(sizes)
    .filter((size) => size.source_url && size.width)
    .map((size) => `${size.source_url} ${size.width}w`)
    .join(", ");
};

const getWordPressImageUrl = (image: WordPressImage) =>
  image.url ||
  image.source_url ||
  image.guid?.rendered ||
  resolveMediaUrl(
    image.path && image.filename && !image.path.endsWith(image.filename)
      ? joinUrl(image.path, image.filename)
      : image.path || image.filename
  );

export function getImageAttributes(image: ImageRefSchema) {
  const wpImage = image as WordPressImage;

  return {
    src: getWordPressImageUrl(wpImage),
    srcSet: getWordPressSrcSet(wpImage),
    sizes: "(max-width: 768px) 100vw, 1200px",
    alt: wpImage.alt_text || wpImage.description || "Image",
  };
}
export interface Padding {
  paddingTop: number;
  paddingBottom: number;
}

export const getPadding = (): Padding => {
  const getElementHeight = (element: HTMLElement | null): number => {
    if (!element) return 0;

    const style = window.getComputedStyle(element);
    return (
      element.clientHeight +
      parseFloat(style.marginTop) +
      parseFloat(style.marginBottom) +
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom)
    );
  };

  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  return {
    paddingTop: getElementHeight(header),
    paddingBottom: getElementHeight(footer),
  };
};
