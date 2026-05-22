import { ReactNode, useState, useMemo, useEffect } from "react";
import LoadingPage from "../../pages/Loading";
import { GeneralContext, Preferences } from "../GeneralContext";
import { SITE_OWNER_NAME, STATIC_PREFERENCES } from "../../config/staticSite";
import { getApiBaseUrl } from "../../config/api";

interface GeneralProviderProps {
  children: ReactNode;
}

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

      setPreferences({
        ...STATIC_PREFERENCES,
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
