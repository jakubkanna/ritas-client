import { ReactNode, useState, useMemo, useEffect } from "react";
import LoadingPage from "../../pages/Loading";
import { GeneralContext, Preferences } from "../GeneralContext";
import { SITE_OWNER_NAME, STATIC_PREFERENCES } from "../../config/staticSite";
import { buildApiUrl, getApiBaseUrl } from "../../config/api";
import {
  resolveWordPressPath,
  transformWordPressResponse,
} from "../../utils/wordpress";

interface GeneralProviderProps {
  children: ReactNode;
}

type HomePreferences = {
  homepage_urls?: Preferences["homepage_urls"];
};

export const GeneralProvider: React.FC<GeneralProviderProps> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<number | null>(null);

  const fetchPreferences = useMemo(() => {
    const fetchPreferencesFromServer = async () => {
      const apiUrl = getApiBaseUrl();

      if (!apiUrl) {
        setPreferences(STATIC_PREFERENCES);
        setApiConnected(false);
        setStatus(null);
        setLoading(false);
        return;
      }

      let homePreferences: HomePreferences = {};

      try {
        const homeApiUrl = buildApiUrl(resolveWordPressPath("home"));

        if (homeApiUrl) {
          const response = await fetch(homeApiUrl);
          const contentType = response.headers.get("content-type");

          if (response.ok && contentType?.includes("application/json")) {
            const data = await response.json();
            homePreferences = transformWordPressResponse<HomePreferences>(
              "home",
              data
            );
          }
        }
      } catch (error) {
        console.warn("Using static menu links because the Home page is unavailable.", error);
      }

      setPreferences({
        ...STATIC_PREFERENCES,
        ...homePreferences,
        artists_name: SITE_OWNER_NAME,
      });
      setApiConnected(true);
      setStatus(null);
      setLoading(false);
    };

    return fetchPreferencesFromServer;
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return (
    <GeneralContext.Provider
      value={{
        preferences,
        setPreferences,
        loading,
        setLoading,
        apiConnected,
      }}
    >
      {loading ? (
        <LoadingPage />
      ) : status === 429 ? (
        <p className="font-monospace">
          You have been timed-out. Please try again later.
        </p>
      ) : (
        children
      )}
    </GeneralContext.Provider>
  );
};
