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
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedRoomId === room.roomId
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(room.roomId)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-[#ffffff22] flex items-center justify-center">
              #
            </div>
            <span>{room.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupChannelList;
