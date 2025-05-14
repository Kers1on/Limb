import { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend, IoImageOutline } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useMatrix } from "@/lib/matrixContext";
import { MsgType } from "matrix-js-sdk";

const MessageBar = () => {
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { client, selectedRoomId, setIsUploading, setFileUploadProgress } =
    useMatrix();

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

  const compressImageToJpg = (file: File, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          img.src = reader.result;
        }
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get canvas context"));

        ctx.drawImage(img, 0, 0, img.width, img.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Compression failed"));
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!client || !selectedRoomId) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      setIsUploading(true);
      setFileUploadProgress(0);

      const compressedBlob = await compressImageToJpg(file, 0.7);

      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, ".jpg"),
        {
          type: "image/jpeg",
        }
      );

      const response = await client.uploadContent(compressedFile, {
        progressHandler: (progress) => {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setFileUploadProgress(percentage);
        },
      });

      const mxcUrl = response.content_uri;

      setIsUploading(false);

      await client.sendMessage(selectedRoomId, {
        msgtype: MsgType.Image,
        body: compressedFile.name,
        filename: compressedFile.name,
        url: mxcUrl,
        info: {
          mimetype: compressedFile.type,
          size: compressedFile.size,
        },
      });
    } catch (error) {
      setIsUploading(false);
      console.error("Error sending image:", error);
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
      setIsUploading(true);
      setFileUploadProgress(0);

      const response = await client.uploadContent(file, {
        progressHandler: (progress) => {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setFileUploadProgress(percentage);
        },
      });

      const mxcUrl = response.content_uri;
      setIsUploading(false);

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
      setIsUploading(false);
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
          onClick={handleImageClick}
        >
          <IoImageOutline className="text-2xl" />
        </button>
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          onChange={handleImageChange}
          accept=".png, .jpg, .jpeg, .svg, .webp"
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
