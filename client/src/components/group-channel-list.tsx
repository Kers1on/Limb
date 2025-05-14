import { useEffect, useState } from "react";
import { useMatrix } from "@/lib/matrixContext";
import { ClientEvent } from "matrix-js-sdk";

interface GroupChannel {
  roomId: string;
  name: string;
}

const GroupChannelList = () => {
  const { client, isClientReady, selectedRoomId, setSelectedRoomId } =
    useMatrix();
  const [groupRooms, setGroupRooms] = useState<GroupChannel[]>([]);

  useEffect(() => {
    if (!client || !isClientReady) return;

    const updateGroupRooms = () => {
      const allRooms = client.getRooms();
      const groups: GroupChannel[] = [];

      for (const room of allRooms) {
        const topicEvent = room.currentState.getStateEvents("m.room.topic", "");
        const isGroup = topicEvent?.getContent()?.type === "group";

        if (isGroup) {
          groups.push({
            roomId: room.roomId,
            name: room.name || room.roomId,
          });
        }
      }

      setGroupRooms(groups);
    };

    updateGroupRooms();
    client.on(ClientEvent.Room, updateGroupRooms);
    return () => {
      client.removeListener(ClientEvent.Room, updateGroupRooms);
    };
  }, [client, isClientReady]);

  const handleClick = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="mt-5">
      {groupRooms.map((room) => (
        <div
          key={room.roomId}
          className={`pl-1 py-2 transition-all duration-300 cursor-pointer rounded-lg ${
            selectedRoomId === room.roomId
              ? "bg-[#6b21a8] hover:bg-[#6b21a8] border-l-4 border-[#c084fc]"
              : "hover:bg-[#2a2b33] hover:border-l-4 hover:border-[#9333ea]"
          }`}
          onClick={() => handleClick(room.roomId)}
        >
          <div className="flex gap-5 items-center justify-start text-[#e0d4ff]">
            <div
              className={`h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold ${
                selectedRoomId === room.roomId
                  ? "bg-[#ffffff22] border-2 border-[#6b21a8]"
                  : "bg-[#1e1f29] text-[#c084fc]"
              }`}
            >
              #
            </div>
            <span className="text-sm">{room.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupChannelList;
