const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const PRODUCTION_SITE_URL = "https://ritaborralhosilva.com";

const WORDPRESS_API_PATH = "wp-json/wp/v2";

const getConfiguredApiBaseUrl = () =>
  import.meta.env.VITE_SERVER_API_URL?.trim() || null;

export const getWordPressOrigin = () => {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();

  if (configuredApiBaseUrl) {
    return new URL(
      configuredApiBaseUrl,
      typeof window === "undefined"
        ? PRODUCTION_SITE_URL
        : window.location.origin
    ).origin;
  }

  if (import.meta.env.PROD) return PRODUCTION_SITE_URL;
  if (typeof window === "undefined") return "";

  return window.location.origin;
};

export const getApiBaseUrl = () => {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();

  if (configuredApiBaseUrl) return configuredApiBaseUrl;

  const origin = getWordPressOrigin();

  if (!origin) return null;

  return `${origin}/${WORDPRESS_API_PATH}`;
};

export const buildApiUrl = (path: string) => {
  const baseApiUrl = getApiBaseUrl();

  if (!baseApiUrl) {
    return null;
  }

  const cleanBase = baseApiUrl.replace(/\/+$/g, "");
  const cleanPath = trimSlashes(path);
  const url = new URL(
    `${cleanBase}/${cleanPath}`,
    typeof window === "undefined" ? PRODUCTION_SITE_URL : window.location.origin
  );
  url.searchParams.set("_cb", String(Date.now()));

  return url.toString();
};
