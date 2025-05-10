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

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import Lottie from "lottie-react";
import { useMatrix } from "@/lib/matrixContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCustomHttpForMxc } from "@/lib/clientDataService";
import { Preset, AccountDataEvents } from "matrix-js-sdk";

function NewDM() {
  const { client, setSelectedRoomId } = useMatrix();
  const [openNewContantModal, setOpenNewContantModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState<
    { userId: string; displayName: string; avatarUrl: string | null }[]
  >([]);

  const searchContact = async (searchTerm: string) => {
    if (!client) {
      console.error("Matrix client is not initialized.");
      return;
    }

    try {
      if (searchTerm.length === 0) {
        setSearchedContacts([]);
      }

      if (searchTerm.length > 0) {
        const response = await client.searchUserDirectory({
          term: searchTerm,
        });

        if (response) {
          const users = response.results.map((user: any) => ({
            userId: user.user_id,
            displayName: user.display_name || user.user_id,
            avatarUrl: user.avatar_url
              ? getCustomHttpForMxc(
                  client.baseUrl,
                  user.avatar_url,
                  client.getAccessToken() || ""
                )
              : null,
          }));
          setSearchedContacts(users);
        } else {
          setSearchedContacts([]);
        }
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    }
  };

  const selectNewContact = async (contact: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
  }) => {
    if (!client) {
      console.error("Matrix client is not initialized.");
      return;
    }

    // 1. Отримуємо m.direct
    const directEvent = client.getAccountData(
      "m.direct" as keyof AccountDataEvents
    );
    const directMap = (directEvent?.getContent() || {}) as Record<
      string,
      string[]
    >;

    const contactRoomIds = directMap[contact.userId] || [];

    // 2. Перевіряємо, чи якась із кімнат ще існує в клієнта
    for (const roomId of contactRoomIds) {
      const room = client.getRoom(roomId);
      if (room) {
        setSelectedRoomId(room.roomId);
        setOpenNewContantModal(false);
        setSearchedContacts([]);
        return;
      }
    }

    // 3. Інакше створюємо нову кімнату
    try {
      const res = await client.createRoom({
        invite: [contact.userId],
        preset: Preset.PrivateChat,
        is_direct: true,
      });

      const newRoomId = res.room_id;

      // 4. Оновлюємо m.direct
      const updatedDirectMap = {
        ...directMap,
        [contact.userId]: [...(directMap[contact.userId] || []), newRoomId],
      };

      await client.setAccountData(
        "m.direct" as keyof AccountDataEvents,
        updatedDirectMap
      );

      setSelectedRoomId(newRoomId);
      setOpenNewContantModal(false);
      setSearchedContacts([]);
    } catch (err) {
      console.error("Failed to create DM room:", err);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewContantModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewContantModal} onOpenChange={setOpenNewContantModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => searchContact(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[250px]">
              <div className="flex flex-col gap-5">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact.userId}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {contact.avatarUrl ? (
                          <AvatarImage
                            src={contact.avatarUrl}
                            alt="Profile"
                            className="object-cover w-full h-full bg-black"
                          />
                        ) : (
                          <div
                            className={`h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor()}`}
                          >
                            {contact.displayName
                              ? contact.displayName.charAt(0).toUpperCase()
                              : contact.userId?.charAt(1).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span>
                        {contact.displayName
                          ? contact.displayName
                          : contact.userId?.split(":")[0].slice(1)}
                      </span>
                      <span className="text-xs">{contact.userId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {searchedContacts.length <= 0 && (
            <div className="flex-1 md:flex mt-5 md:mt-0 flex-col justify-center items-center duration-1000 transition-all">
              <Lottie
                animationData={animationDefaultOptions.animationData}
                loop={animationDefaultOptions.loop}
                autoplay={animationDefaultOptions.autoplay}
                style={{ width: "100px", height: "100px" }}
              />
              <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                  Hi<span className="text-purple-500">!</span> Search new{" "}
                  <span className="text-purple-500"> Contacts. </span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NewDM;
