import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useMatrix } from "@/lib/matrixContext";
import { getCustomHttpForMxc } from "@/lib/clientDataService";
import { Preset, AccountDataEvents } from "matrix-js-sdk";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";
import { getColor } from "@/lib/utils";

function CreateChannel() {
  const { client, isClientReady } = useMatrix();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState<
    { userId: string; displayName: string; avatarUrl: string | null }[]
  >([]);
  const [selectedContacts, setSelectedContacts] = useState<
    { userId: string; displayName: string; avatarUrl: string | null }[]
  >([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    if (!client) return;

    const fetchContacts = async () => {
      try {
        const directEvent = client.getAccountData(
          "m.direct" as keyof AccountDataEvents
        );
        const directMap = (directEvent?.getContent() || {}) as Record<
          string,
          string[]
        >;

        const users: {
          userId: string;
          displayName: string;
          avatarUrl: string | null;
        }[] = [];

        for (const [userId, roomIds] of Object.entries(directMap)) {
          for (const roomId of roomIds) {
            const room = client.getRoom(roomId);
            if (!room) continue;

            const member = room.getMember(userId);
            if (!member) continue;

            users.push({
              userId: member.userId,
              displayName: member.name || member.userId,
              avatarUrl: member.getMxcAvatarUrl()
                ? getCustomHttpForMxc(
                    client.baseUrl,
                    member.getMxcAvatarUrl() || "",
                    client.getAccessToken() || ""
                  )
                : null,
            });

            break;
          }
        }

        setAllContacts(users);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };

    fetchContacts();
  }, [client, isClientReady]);

  const createChannel = async () => {
    if (!client || !channelName || selectedContacts.length === 0) return;

    try {
      const invitedUserIds = selectedContacts.map((contact) => contact.userId);

      const response = await client.createRoom({
        name: channelName,
        preset: Preset.PrivateChat,
        invite: invitedUserIds,
        is_direct: false,
        initial_state: [
          {
            type: "m.room.topic",
            state_key: "",
            content: {
              topic: "No Topic",
              type: "group",
            },
          },
        ],
      });

      const roomId = response.room_id;

      if (roomId) {
        setNewChannelModal(false);
        setChannelName("");
        setSelectedContacts([]);
      }
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  return (
  <>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-[#c084fc] cursor-pointer transition-all duration-300"
            onClick={() => setNewChannelModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
          Create New Channel
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
      <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col rounded-lg shadow-[0_4px_15px_#9333ea66]">
        <DialogHeader>
          <DialogTitle className="text-[#c084fc]">
            Please fill up the details for new channel
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400">
            Enter the name and select contacts for the new channel.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Input
            placeholder="Channel Name"
            className="rounded-lg p-6 bg-[#2c2e3b] border-none focus:outline-none focus:ring-2 focus:ring-[#6b21a8] text-[#e0d4ff]"
            onChange={(e) => setChannelName(e.target.value)}
            value={channelName}
          />
        </div>

        <div className="mt-4">
          <MultipleSelector
            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
            defaultOptions={allContacts.map((contact) => ({
              value: contact.userId,
              label: contact.displayName,
              avatarUrl: contact.avatarUrl || "",
              color: getColor(),
            }))}
            placeholder="Search Contacts"
            value={selectedContacts.map((contact) => ({
              value: contact.userId,
              label: contact.displayName,
              avatarUrl: contact.avatarUrl || "",
              color: getColor(),
            }))}
            onChange={(options) =>
              setSelectedContacts(
                options.map((option) => ({
                  userId: option.value,
                  displayName: option.label,
                  avatarUrl:
                    typeof option.avatarUrl === "string"
                      ? option.avatarUrl
                      : null,
                  color: option.color,
                }))
              )
            }
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600">
                No results found.
              </p>
            }
          />
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300 text-white rounded-lg py-3"
            onClick={createChannel}
          >
            Create Channel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
);

}

export default CreateChannel;
