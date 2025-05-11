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

  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  isDownloading: boolean;
  setIsDownloading: (isDownloading: boolean) => void;
  fileUploadProgress: number;
  setFileUploadProgress: (progress: number) => void;
  fileDownloadProgress: number;
  setFileDownloadProgress: (progress: number) => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [selectedRoomId, setSelectedRoomIdState] = useState<string | null>(
    null
  );
  const [isRestoring, setIsRestoring] = useState(true);
  const [isClientReady, setIsClientReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileDownloadProgress, setFileDownloadProgress] = useState(0);

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
        isUploading,
        setIsUploading,
        isDownloading,
        setIsDownloading,
        fileUploadProgress,
        setFileUploadProgress,
        fileDownloadProgress,
        setFileDownloadProgress,
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
