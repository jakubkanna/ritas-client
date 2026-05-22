import { useState, useEffect } from "react";
import handleFetchError from "../utils/handleFetchError";
import { buildApiUrl } from "../config/api";
import {
  resolveWordPressPath,
  transformWordPressResponse,
} from "../utils/wordpress";

export const useFetchData = <T,>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiPath = resolveWordPressPath(path);
      const apiUrl = buildApiUrl(apiPath);

      if (!apiUrl) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(handleFetchError(response.status));
        }
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("API response was not JSON.");
        }

        const result = await response.json();
        setData(transformWordPressResponse<T>(path, result));
      } catch (err) {
        setError(
          (err as Error).message || "An error occurred while fetching data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  return { data, loading, error };
};
