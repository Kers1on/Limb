import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCustomHttpForMxc } from "@/lib/clientDataService";
import { useMatrix } from "@/lib/matrixContext";
import { useEffect, useState } from "react";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = () => {
  const { client, selectedRoomId, setSelectedRoomId, isClientReady } =
    useMatrix();

  const [member, setMember] = useState<{
    userId?: string;
    displayName: string;
    avatarUrl: string | null;
    isGroup: boolean;
  } | null>(null);

  useEffect(() => {
    if (!client || !selectedRoomId || !isClientReady) return;

    const room = client.getRoom(selectedRoomId);
    if (!room) return;

    // 1. Перевіряємо чи є m.room.topic з типом group
    const topicEvent = room.currentState.getStateEvents("m.room.topic", "");
    const isGroup = topicEvent?.getContent()?.type === "group";

    if (isGroup) {
      const name = room.name || "Група";
      const avatarMxc = room.getMxcAvatarUrl() || "";
      const avatarUrl = avatarMxc
        ? getCustomHttpForMxc(
            client.baseUrl,
            avatarMxc,
            client.getAccessToken() || ""
          )
        : null;

      setMember({
        displayName: name,
        avatarUrl,
        isGroup: true,
      });
    } else {
      const myUserId = client.getUserId();
      const joinedMembers = room.getJoinedMembers();
      const otherMember = joinedMembers.find((m) => m.userId !== myUserId);

      if (otherMember) {
        const avatarMxc = otherMember.getMxcAvatarUrl() || "";
        const avatarUrl = avatarMxc
          ? getCustomHttpForMxc(
              client.baseUrl,
              avatarMxc,
              client.getAccessToken() || ""
            )
          : null;

        setMember({
          userId: otherMember.userId,
          displayName: otherMember.name || otherMember.userId,
          avatarUrl,
          isGroup: false,
        });
      } else {
        setMember(null);
      }
    }
  }, [client, selectedRoomId, isClientReady]);

  return (
    <div className="h-[10vh] border-b border-[#2a2b33] bg-[#1e1f2a] px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex gap-4 items-center w-full justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 relative">
            {!member?.isGroup ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {member?.avatarUrl ? (
                  <AvatarImage
                    src={member.avatarUrl}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`h-12 w-12 text-lg border border-[#9333ea] flex items-center justify-center rounded-full text-[#d8b4fe] bg-[#121219]`}
                  >
                    {member?.displayName
                      ? member.displayName.charAt(0).toUpperCase()
                      : member?.userId?.charAt(1).toUpperCase()}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] border border-[#9333ea55] h-12 w-12 flex items-center justify-center rounded-full text-purple-300 text-xl">
                #
              </div>
            )}
          </div>
          <div className="text-white text-opacity-90 poppins-medium">
            {member?.displayName
              ? member.displayName
              : member?.userId?.split(":")[0].slice(1)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-neutral-400 hover:text-white transition-colors duration-300 cursor-pointer"
            onClick={() => setSelectedRoomId(null)}
          >
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
