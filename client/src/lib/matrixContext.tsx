import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, MatrixClient, ClientEvent } from "matrix-js-sdk";

interface MatrixContextType {
  client: MatrixClient | null;
  setClient: (client: MatrixClient | null) => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restoreClient = async () => {
      try {
        // Change to another storage method
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        const baseUrl = localStorage.getItem("baseUrl");
        const deviceId = localStorage.getItem("deviceId");

        if (accessToken && userId && baseUrl && deviceId) {
          const restoredClient = createClient({
            baseUrl,
            accessToken,
            userId,
            deviceId,
            useAuthorizationHeader: true,
          });

          restoredClient.once(ClientEvent.Sync, (state) => {
            if (state === "PREPARED") {
              console.log("Matrix client is ready!");
            } else {
              console.log("State is:", state);
            }
          });

          restoredClient.startClient();
          setClient(restoredClient);
        }
      } catch (error) {
        console.error("Failed to restore Matrix client:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreClient();
  }, []);

  if (isRestoring) {
    return <div>Loading...</div>;
  }

  return (
    <MatrixContext.Provider value={{ client, setClient }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error("useMatrix must be used within a MatrixProvider");
  }
  return context;
};
