import { getCustomHttpForMxc } from "@/lib/clientDataService";
import { useMatrix } from "@/lib/matrixContext";
import { getColor } from "@/lib/utils";
import { AccountDataEvents, ClientEvent } from "matrix-js-sdk";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";

interface ContactMember {
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

const ContactList = () => {
  const { client, isClientReady, selectedRoomId, setSelectedRoomId } =
    useMatrix();
  const [directContacts, setDirectContacts] = useState<ContactMember[]>([]);

  useEffect(() => {
    if (!client || !isClientReady) return;

    const updateContacts = () => {
      const dmMap = client
        .getAccountData("m.direct" as keyof AccountDataEvents)
        ?.getContent() as Record<string, string[]>;

      const rooms = client.getRooms();
      const contacts: ContactMember[] = [];

      if (dmMap) {
        for (const roomIds of Object.values(dmMap)) {
          for (const roomId of roomIds) {
            const room = rooms.find((r) => r.roomId === roomId);
            if (!room) continue;

            // ❌ Пропускаємо кімнати з topic === "group"
            const topicEvent = room.currentState.getStateEvents(
              "m.room.topic",
              ""
            );
            const topic = topicEvent?.getContent()?.topic;
            if (topic === "group") continue;

            const myUserId = client.getUserId();
            const otherMember = room
              .getJoinedMembers()
              .find((m) => m.userId !== myUserId);
            if (!otherMember) continue;

            const avatarUrl = otherMember.getMxcAvatarUrl()
              ? getCustomHttpForMxc(
                  client.baseUrl,
                  otherMember.getMxcAvatarUrl() || "",
                  client.getAccessToken() || ""
                )
              : null;

            contacts.push({
              roomId: room.roomId,
              userId: otherMember.userId,
              displayName: otherMember.name || otherMember.userId,
              avatarUrl,
            });
          }
        }
      }

      setDirectContacts(contacts);
    };

    if (client.getSyncState() === "SYNCING") {
      updateContacts();
    }

    const handleSync = (state: string) => {
      if (state === "SYNCING") {
        updateContacts();
      }
    };

    client.on(ClientEvent.Sync, handleSync);
    return () => {
      client.removeListener(ClientEvent.Sync, handleSync);
    };
  }, [client, isClientReady]);

  const handleClick = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="mt-5">
      {directContacts.map((member) => (
        <div
          key={member.roomId}
          className={`pl-1 py-2 transition-all duration-300 cursor-pointer ${
            selectedRoomId === member.roomId
              ? "bg-[#6b21a8] hover:bg-[#6b21a8] border-l-4 border-[#c084fc]"
              : "hover:bg-[#2a2b33] hover:border-l-4 hover:border-[#9333ea]"
          } rounded-lg`}
          onClick={() => handleClick(member.roomId)}
        >
          <div className="flex gap-5 items-center justify-start text-[#e0d4ff]">
            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
              {member.avatarUrl ? (
                <AvatarImage
                  src={member.avatarUrl}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`${
                    selectedRoomId === member.roomId
                      ? "bg-[#ffffff22] border-2 border-[#6b21a8]"
                      : "bg-[#121219] text-[#d8b4fe]"
                  } h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                >
                  {member.displayName
                    ? member.displayName.charAt(0).toUpperCase()
                    : member.userId.charAt(1).toUpperCase()}
                </div>
              )}
            </Avatar>
            <span className="text-sm">
              {client?.getRoom(member.roomId)?.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
