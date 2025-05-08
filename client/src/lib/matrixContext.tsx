import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, MatrixClient, ClientEvent } from "matrix-js-sdk";
import {
  getSession,
  saveSelectedRoomId,
  getSelectedRoomId,
  clearSelectedRoomId,
} from "./storageSession";

interface MatrixContextType {
  client: MatrixClient | null;
  setClient: (client: MatrixClient | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (roomId: string | null) => void;
  isClientReady: boolean;
  setIsClientReady: (isReady: boolean) => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [selectedRoomId, setSelectedRoomIdState] = useState<string | null>(
    null
  );
  const [isClientReady, setIsClientReady] = useState(false);

  const [isRestoring, setIsRestoring] = useState(true);

  const setSelectedRoomId = (roomId: string | null) => {
    setSelectedRoomIdState(roomId);
    if (roomId) {
      saveSelectedRoomId(roomId);
    } else {
      clearSelectedRoomId();
    }
  };

  useEffect(() => {
    const restoreClient = async () => {
      try {
        const { accessToken, userId, baseUrl, deviceId } = getSession();

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
              setIsClientReady(true);
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

  useEffect(() => {
    if (isClientReady) {
      const storedRoomId = getSelectedRoomId();
      if (storedRoomId) {
        setSelectedRoomIdState(storedRoomId);
      }
    }
  }, [isClientReady]);

  if (isRestoring) {
    return <div>Loading...</div>;
  }

  return (
    <MatrixContext.Provider
      value={{
        client,
        setClient,
        selectedRoomId,
        setSelectedRoomId,
        isClientReady,
        setIsClientReady,
      }}
    >
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
