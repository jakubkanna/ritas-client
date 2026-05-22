import handleFetchError from "./handleFetchError";
import { buildApiUrl } from "../config/api";
import { resolveWordPressPath, transformWordPressResponse } from "./wordpress";

export const fetchData = async <T>(path: string): Promise<T> => {
  const apiPath = resolveWordPressPath(path);
  const apiUrl = buildApiUrl(apiPath);

  if (!apiUrl) {
    throw new Error("API is not configured.");
  }

  const response = await fetch(apiUrl);
  if (!response.ok) handleFetchError(response.status);
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("API response was not JSON.");
  }

  const data = await response.json();
  return transformWordPressResponse<T>(path, data);
};
