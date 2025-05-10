import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCustomHttpForMxc } from "@/lib/clientDataService";
import { useMatrix } from "@/lib/matrixContext";
import { getColor } from "@/lib/utils";
import { useEffect, useState } from "react";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = () => {
  const { client, selectedRoomId, setSelectedRoomId, isClientReady } =
    useMatrix();
  const [member, setMember] = useState<{
    userId: string;
    displayName: string;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    if (!client || !selectedRoomId || !isClientReady) return;

    const room = client.getRoom(selectedRoomId);
    if (!room) return;

    const myUserId = client.getUserId();
    const joinedMembers = room.getJoinedMembers();

    const otherMember = joinedMembers.find((m) => m.userId !== myUserId);

    if (otherMember) {
      const member = {
        userId: otherMember.userId,
        displayName: otherMember.name || otherMember.userId,
        avatarUrl: otherMember.getMxcAvatarUrl()
          ? getCustomHttpForMxc(
              client.baseUrl,
              otherMember.getMxcAvatarUrl() || "",
              client.getAccessToken() || ""
            )
          : null,
      };
      setMember(member);
    } else {
      setMember(null);
    }
  }, [client, selectedRoomId, isClientReady]);

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {member?.avatarUrl ? (
                <AvatarImage
                  src={member.avatarUrl}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor()}`}
                >
                  {member?.displayName
                    ? member.displayName.charAt(0).toUpperCase()
                    : member?.userId?.charAt(1).toUpperCase()}
                </div>
              )}
            </Avatar>
          </div>
          <div>
            {member?.displayName
              ? member.displayName
              : member?.userId?.split(":")[0].slice(1)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="text-neutral-500 focus:border-none focus:outline-non focus:text-white duration-300 transition-all cursor-pointer"
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
