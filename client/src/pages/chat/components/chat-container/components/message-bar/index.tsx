import { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useMatrix } from "@/lib/matrixContext";
import { MsgType } from "matrix-js-sdk";

const MessageBar = () => {
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { client, selectedRoomId } = useMatrix();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emojiData: EmojiClickData) => {
    setMessage((msg) => msg + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if (!client || !selectedRoomId) return;
    if (message.trim() === "") return;

    const currentMessage = message;
    setMessage("");

    try {
      await client.sendTextMessage(selectedRoomId, currentMessage);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!client || !selectedRoomId) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      const response = await client.uploadContent(file);
      const mxcUrl = response.content_uri;

      await client.sendMessage(selectedRoomId, {
        msgtype: MsgType.File,
        body: file.name,
        filename: file.name,
        url: mxcUrl,
        info: {
          mimetype: file.type,
          size: file.size,
        },
      });
    } catch (error) {
      console.error("Error sending file:", error);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-non focus:text-white duration-300 transition-all cursor-pointer"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-non focus:text-white duration-300 transition-all cursor-pointer"
            onClick={() => setEmojiPickerOpen((prev) => !prev)}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme={Theme.DARK}
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all cursor-pointer"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
