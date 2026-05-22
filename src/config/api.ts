const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const getApiBaseUrl = () => import.meta.env.VITE_SERVER_API_URL?.trim();

export const buildApiUrl = (path: string) => {
  const baseApiUrl = getApiBaseUrl();

  if (!baseApiUrl) {
    return null;
  }

  const cleanBase = baseApiUrl.replace(/\/+$/g, "");
  const cleanPath = trimSlashes(path);

  return `${cleanBase}/${cleanPath}`;
};
