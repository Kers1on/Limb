import { useMatrix } from "@/lib/matrixContext";
import {
  MatrixClient,
  MatrixEvent,
  MatrixEventEvent,
  MsgType,
  Room,
  RoomEvent,
} from "matrix-js-sdk";
import { useEffect, useRef, useState } from "react";
import { getCustomHttpForMxc, isDirectRoomFunc } from "@/lib/clientDataService";
import moment from "moment";
import { FileInfo } from "matrix-js-sdk/lib/@types/media";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowDown } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

interface Message {
  timeStamp: number;
  sender: string | undefined;
  content: string;
  msgtype: string;
  mxcUrl: string | undefined;
  info: FileInfo | undefined;
  senderDisplayName: string | undefined;
  senderAvatarUrl: string | undefined;
}

function MessageContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { client, selectedRoomId, setIsDownloading, setFileDownloadProgress } =
    useMatrix();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDirectRoom, setIsDirectRoom] = useState<boolean | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageMxcUrl, setImageMxcUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");

  const parseMatrixEvent = (
    event: MatrixEvent,
    room: Room,
    senderId: string,
    client: MatrixClient
  ): Message | null => {
    const content = event.getContent();
    if (
      content.msgtype === MsgType.Text ||
      content.msgtype === MsgType.File ||
      content.msgtype === MsgType.Image
    ) {
      const member = room?.getMember(senderId);
      const displayName = member?.name;
      const avatarUrl = getCustomHttpForMxc(
        client.baseUrl,
        member?.getMxcAvatarUrl() || "",
        client.getAccessToken() || ""
      );

      return {
        timeStamp: event.getTs(),
        sender: event.getSender(),
        content: content.body,
        msgtype: content.msgtype,
        mxcUrl: content.url,
        info: content.info,
        senderDisplayName: displayName,
        senderAvatarUrl: avatarUrl,
      };
    }
    return null;
  };

  // Get N old messages when scrolling to the top
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !client || !selectedRoomId) return;

    const handleScroll = async () => {
      if (container.scrollTop === 0) {
        const room = client.getRoom(selectedRoomId);
        if (!room) return;

        try {
          const prevScrollHeight = container.scrollHeight;

          await client.scrollback(room, 20); // завантажити ще 20 старих повідомлень

          const events = room.timeline
            .filter((event) => event.getType() === "m.room.message")
            .map((event) => {
              const senderId = event.getSender();
              if (!senderId) return;

              return parseMatrixEvent(event, room, senderId, client);
            })
            .filter((msg): msg is Message => msg !== null);

          setMessages(events);

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }, 0);
        } catch (error) {
          console.error("Не вдалося завантажити більше повідомлень:", error);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [client, selectedRoomId]);

  // Get the last 30 messages from the room
  useEffect(() => {
    const fetchOldMessages = async () => {
      if (!client || !selectedRoomId) return;

      const room = client.getRoom(selectedRoomId);
      if (!room) return;

      try {
        await client.scrollback(room, 30);

        const events = room
          .getLiveTimeline()
          .getEvents()
          .filter((event) => event.getType() === "m.room.message")
          .map((event) => {
            const senderId = event.getSender();
            if (!senderId) return;

            return parseMatrixEvent(event, room, senderId, client);
          })
          .filter((msg): msg is Message => msg !== null);

        setMessages(events);
      } catch (error) {
        console.error("Не вдалося отримати історію повідомлень:", error);
      }
    };

    fetchOldMessages();
  }, [client, selectedRoomId]);

  // Retrieve new messages from the room
  useEffect(() => {
    if (!client || !selectedRoomId) return;

    const room = client.getRoom(selectedRoomId);
    if (!room) return;

    const handleNewEvent = (event: MatrixEvent) => {
      const processEvent = () => {
        const content = event.getContent();
        if (
          content.msgtype === MsgType.Text ||
          content.msgtype === MsgType.File ||
          content.msgtype === MsgType.Image
        ) {
          const senderId = event.getSender();
          if (!senderId) return;

          const member = room.getMember(senderId);
          const displayName = member?.name;
          const avatarUrl = getCustomHttpForMxc(
            client.baseUrl,
            member?.getMxcAvatarUrl() || "",
            client.getAccessToken() || ""
          );

          const newMessage: Message = {
            timeStamp: event.getTs(),
            sender: senderId,
            content: content.body,
            msgtype: content.msgtype,
            mxcUrl: content.url,
            info: content.info,
            senderAvatarUrl: avatarUrl,
            senderDisplayName: displayName,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      };

      if (event.isEncrypted()) {
        event.once(MatrixEventEvent.Decrypted, processEvent);
      } else {
        processEvent();
      }
    };

    const timelineHandler = (
      event: MatrixEvent,
      room: Room | undefined,
      toStartOfTimeline: boolean | undefined
    ) => {
      if (toStartOfTimeline || !room || room.roomId !== selectedRoomId) return;
      handleNewEvent(event);
    };

    client.on(RoomEvent.Timeline, timelineHandler);

    return () => {
      client.off(RoomEvent.Timeline, timelineHandler);
    };
  }, [client, selectedRoomId]);

  // Check if the room is a direct message room
  useEffect(() => {
    if (!client || !selectedRoomId) return;
    const direct = isDirectRoomFunc(client, selectedRoomId);
    setIsDirectRoom(direct);
  }, [client, selectedRoomId]);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkIfFileImage = (mimetype?: string) => {
    if (!mimetype) return false;
    return mimetype.startsWith("image/");
  };
  const checkIfFileVideo = (mimetype?: string) => {
    if (!mimetype) return false;
    return mimetype.startsWith("video/");
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${sizes[i]}`;
  };

  const downloadFile = async (
    mxcUrl: string | undefined,
    imageName: string
  ) => {
    if (!mxcUrl || !client) return;

    setIsDownloading(true);
    setFileDownloadProgress(0);

    const url = getCustomHttpForMxc(
      client.baseUrl,
      mxcUrl,
      client.getAccessToken() || ""
    );

    try {
      const response = await fetch(url);
      const contentLength = response.headers.get("Content-Length");

      if (!response.ok || !response.body || !contentLength) {
        throw new Error("Download failed or streaming not supported.");
      }

      const total = parseInt(contentLength, 10);
      const reader = response.body.getReader();
      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          const progress = Math.round((received / total) * 100);
          setFileDownloadProgress(progress);
        }
      }

      const blob = new Blob(chunks);
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = imageName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderMessages = () => {
    let lastDate: string | null = null;
    return messages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD.MM.YYYY");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center my-6">
              <span className="px-4 py-1 text-sm text-purple-300 bg-[#2a2b33] rounded-full">
                {messageDate}
              </span>
            </div>
          )}
          {isDirectRoom && renderDMMessages(message)}
          {!isDirectRoom && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message: Message) => {
    const isOwnMessage = message.sender === client?.getUserId();
    const bubbleStyle = isOwnMessage
      ? "bg-[#8417ff]/10 text-[#d9bfff] border-[#8417ff]/40"
      : "bg-[#1e1f29]/50 text-white/80 border-white/10";

    return (
      <div className={`${isOwnMessage ? "text-right" : "text-left"} my-2`}>
        {message.msgtype === MsgType.Text && (
          <div
            className={`border inline-block px-4 py-2 rounded-xl max-w-[65%] break-words backdrop-blur-sm transition-all duration-200 ${bubbleStyle}`}
          >
            {message.content}
          </div>
        )}

        {message.msgtype === MsgType.File && (
          <div
            className={`border inline-block px-4 py-2 rounded-xl max-w-[65%] break-words backdrop-blur-sm transition-all duration-200 ${bubbleStyle}`}
          >
            {checkIfFileImage(message.info?.mimetype) && (
              <div
                className="flex gap-4 items-start cursor-pointer hover:brightness-110"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(
                    getCustomHttpForMxc(
                      client?.baseUrl ?? "",
                      message.mxcUrl || "",
                      client?.getAccessToken() || ""
                    )
                  );
                  setImageMxcUrl(message.mxcUrl || "");
                  setImageName(message.content);
                }}
              >
                <img
                  src={getCustomHttpForMxc(
                    client?.baseUrl ?? "",
                    message.mxcUrl || "",
                    client?.getAccessToken() || ""
                  )}
                  alt={message.content}
                  width={75}
                  className="rounded-md shadow-lg"
                />
                <div className="flex flex-col justify-start">
                  <span>{message.content}</span>
                  <span className="text-xs text-white/60">
                    {formatFileSize(message.info?.size)}
                  </span>
                </div>
              </div>
            )}

            {checkIfFileVideo(message.info?.mimetype) && (
              <div className="flex gap-4 items-start cursor-pointer">
                <video
                  controls
                  src={getCustomHttpForMxc(
                    client?.baseUrl ?? "",
                    message.mxcUrl || "",
                    client?.getAccessToken() || ""
                  )}
                  width={300}
                  className="rounded-md shadow-md"
                />
              </div>
            )}

            {!checkIfFileImage(message.info?.mimetype) &&
              !checkIfFileVideo(message.info?.mimetype) && (
                <div
                  className="flex gap-4 items-start cursor-pointer hover:brightness-110"
                  onClick={() => downloadFile(message.mxcUrl, message.content)}
                >
                  <span className="text-3xl text-[#d1d1d1] bg-black/30 rounded-full p-3">
                    <MdFolderZip />
                  </span>
                  <div className="flex flex-col justify-start">
                    <span>{message.content}</span>
                    <span className="text-xs text-white/60">
                      {formatFileSize(message.info?.size)}
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}

        {message.msgtype === MsgType.Image && (
          <div
            className={`border inline-block px-4 py-2 rounded-xl max-w-[65%] break-words backdrop-blur-sm transition-all duration-200 ${bubbleStyle}`}
          >
            <div
              className="flex gap-4 items-start cursor-pointer hover:brightness-110"
              onClick={() => {
                setShowImage(true);
                setImageUrl(
                  getCustomHttpForMxc(
                    client?.baseUrl ?? "",
                    message.mxcUrl || "",
                    client?.getAccessToken() || ""
                  )
                );
                setImageMxcUrl(message.mxcUrl || "");
                setImageName(message.content);
              }}
            >
              <img
                src={getCustomHttpForMxc(
                  client?.baseUrl ?? "",
                  message.mxcUrl || "",
                  client?.getAccessToken() || ""
                )}
                alt={message.content}
                width={300}
                className="rounded-md shadow-lg"
              />
            </div>
          </div>
        )}

        <div className="text-xs mt-1 text-gray-500 italic px-2">
          {moment(message.timeStamp).format("HH:mm")}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message: Message) => (
    <div
      className={`${
        message.sender !== client?.getUserId() ? "text-left" : "text-right"
      } my-2`}
    >
      {message.msgtype === MsgType.Text && (
        <div
          className={`${
            message.sender === client?.getUserId()
              ? "bg-[#8417ff]/10 text-[#d9bfff] border-[#8417ff]/40"
              : "bg-[#1e1f29]/50 text-white/80 border-white/10"
          } border inline-block p-2 rounded-xl max-w-[65%] break-words backdrop-blur-sm transition-all duration-200 ml-9`}
        >
          {message.content}
        </div>
      )}
      {message.msgtype === MsgType.File && (
        <div
          className={`${
            message.sender === client?.getUserId()
              ? "bg-[#8417ff]/10 text-[#d9bfff] border-[#8417ff]/40"
              : "bg-[#1e1f29]/50 text-white/80 border-white/10"
          } border inline-block p-2 rounded-xl max-w-[65%] break-words backdrop-blur-sm transition-all duration-200 ml-9`}
        >
          {checkIfFileImage(message.info?.mimetype) && (
            <div
              className="flex gap-4 items-start cursor-pointer hover:brightness-110"
              onClick={() => {
                setShowImage(true);
                setImageUrl(
                  getCustomHttpForMxc(
                    client?.baseUrl ?? "",
                    message.mxcUrl || "",
                    client?.getAccessToken() || ""
                  )
                );
                setImageMxcUrl(message.mxcUrl || "");
                setImageName(message.content);
              }}
            >
              <img
                src={getCustomHttpForMxc(
                  client?.baseUrl ?? "",
                  message.mxcUrl || "",
                  client?.getAccessToken() || ""
                )}
                alt={message.content}
                width={75}
                className="rounded-md"
              />
              <div className="flex flex-col justify-start">
                <span>{message.content}</span>
                <span className="text-xs text-white/60">
                  {formatFileSize(message.info?.size)}
                </span>
              </div>
            </div>
          )}

          {checkIfFileVideo(message.info?.mimetype) && (
            <div className="flex gap-4 items-start cursor-pointer">
              <video
                controls
                src={getCustomHttpForMxc(
                  client?.baseUrl ?? "",
                  message.mxcUrl || "",
                  client?.getAccessToken() || ""
                )}
                width={300}
                className="rounded-md"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!checkIfFileImage(message.info?.mimetype) &&
            !checkIfFileVideo(message.info?.mimetype) && (
              <div
                className="flex gap-4 items-start cursor-pointer"
                onClick={() => downloadFile(message.mxcUrl, message.content)}
              >
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <div className="flex flex-col justify-start">
                  <span>{message.content}</span>
                  <span className="text-xs text-white/60">
                    {formatFileSize(message.info?.size)}
                  </span>
                </div>
              </div>
            )}
        </div>
      )}
      {message.sender !== client?.getUserId() ? (
        <div className="flex items-center justify-start gap-3">
          <Avatar className="h-8 w-8 rounded-full overflow-hidden">
            {message.senderAvatarUrl ? (
              <AvatarImage
                src={message.senderAvatarUrl}
                alt="Profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <AvatarFallback
                className={`h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor()}`}
              >
                {message.senderDisplayName
                  ? message.senderDisplayName.charAt(0).toUpperCase()
                  : message.sender?.charAt(1).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm text-white/60">
            {message.senderDisplayName}
          </span>
          <span className="text-xs text-white/60">
            {moment(message.timeStamp).format("HH:mm")}
          </span>
        </div>
      ) : (
        <div className="text-xs text-white/60 mt-1">
          {moment(message.timeStamp).format("HH:mm")}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto no-scrollbar p-4 px-6 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full transition-all duration-300"
    >
      {renderMessages()}
      <div ref={scrollRef} />

      {showImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-[#1c1d25dd] backdrop-blur-lg flex flex-col items-center justify-center z-[60] transition-all duration-300"
          onClick={() => {
            setShowImage(false);
            setImageUrl(null);
          }}
        >
          <img
            src={imageUrl ?? ""}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-[0_0_30px_#9333ea55] transition-all duration-300"
          />
          <div className="flex gap-5 fixed bottom-6">
            <button
              className="bg-[#9333ea22] hover:bg-[#9333ea44] text-white rounded-full p-3 text-2xl transition-all duration-300 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(imageMxcUrl ?? "", imageName);
              }}
            >
              <IoMdArrowDown />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageContainer;
