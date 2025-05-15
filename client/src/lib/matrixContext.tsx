import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createClient,
  MatrixClient,
  ClientEvent,
  RoomMemberEvent,
  AccountDataEvents,
} from "matrix-js-sdk";
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

          // 👇 Auto-join при інвайті
          restoredClient.on(RoomMemberEvent.Membership, (_, member) => {
            if (
              member.membership === "invite" &&
              member.userId === restoredClient.getUserId()
            ) {
              restoredClient.joinRoom(member.roomId).catch((err) => {
                console.error("Auto-join failed:", err);
              });
            }
          });

          // 👇 Додаємо кімнату до m.direct при приєднанні
          restoredClient.on(RoomMemberEvent.Membership, async (_, member) => {
            if (
              member.membership === "join" &&
              member.userId === restoredClient.getUserId()
            ) {
              const roomId = member.roomId;
              const room = restoredClient.getRoom(roomId);
              if (!room) return;

              // 👉 Перевірка на наявність події m.room.topic
              const topicEvent = room.currentState.getStateEvents(
                "m.room.topic",
                ""
              );
              const isGroupRoom = !!topicEvent;

              if (isGroupRoom) {
                // Це група, не додаємо в m.direct
                return;
              }

              const otherMember = room
                .getJoinedMembers()
                .find((m) => m.userId !== restoredClient.getUserId());
              if (!otherMember) return;

              const directEvent = restoredClient.getAccountData(
                "m.direct" as keyof AccountDataEvents
              );
              const directMap = (directEvent?.getContent() || {}) as Record<
                string,
                string[]
              >;

              const currentRooms = directMap[otherMember.userId] || [];

              if (!currentRooms.includes(roomId)) {
                const updatedMap = {
                  ...directMap,
                  [otherMember.userId]: [...currentRooms, roomId],
                };

                await restoredClient.setAccountData(
                  "m.direct" as keyof AccountDataEvents,
                  updatedMap
                );
                console.log("Updated m.direct for:", otherMember.userId);
              }
            }
          });

          restoredClient.once(ClientEvent.Sync, (state) => {
            if (state === "PREPARED") {
              setIsClientReady(true);
              setClient(restoredClient);
            }
          });

          restoredClient.startClient();
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
