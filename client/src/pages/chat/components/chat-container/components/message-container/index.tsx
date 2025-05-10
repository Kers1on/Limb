import { useMatrix } from "@/lib/matrixContext";
import { MatrixEvent, MsgType, RoomEvent } from "matrix-js-sdk";
import { useEffect, useRef, useState } from "react";
import { getCustomHttpForMxc, isDirectRoomFunc } from "@/lib/clientDataService";
import moment from "moment";
import { FileInfo } from "matrix-js-sdk/lib/@types/media";
import { MdFolderZip } from "react-icons/md";

interface Message {
  timeStamp: number;
  sender: string | undefined;
  content: string;
  msgtype: string;
  mxcUrl: string | undefined;
  info: FileInfo | undefined;
}

function MessageContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { client, selectedRoomId } = useMatrix();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDirectRoom, setIsDirectRoom] = useState<boolean | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // const [showVideo, setShowVideo] = useState(false);
  // const [videoUrl, setVideoUrl] = useState(null);
  // const [showAudio, setShowAudio] = useState(false);
  // const [audioUrl, setAudioUrl] = useState(null);

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
              const content = event.getContent();
              if (content.msgtype === MsgType.Text) {
                return {
                  timeStamp: event.getTs(),
                  sender: event.getSender(),
                  content: content.body,
                  msgtype: content.msgtype,
                  mxcUrl: undefined,
                  info: undefined,
                } as Message;
              }

              if (content.msgtype === MsgType.File) {
                return {
                  timeStamp: event.getTs(),
                  sender: event.getSender(),
                  content: content.body,
                  msgtype: content.msgtype,
                  mxcUrl: content.url,
                  info: content.info,
                } as Message;
              }
              return null;
            })
            .filter((msg): msg is Message => msg !== null);

          setMessages(events);

          // Після оновлення повідомлень — зберегти позицію скролу
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
            const content = event.getContent();
            if (content.msgtype === MsgType.Text) {
              return {
                timeStamp: event.getTs(),
                sender: event.getSender(),
                content: content.body,
                msgtype: content.msgtype,
                mxcUrl: undefined,
                info: undefined,
              } as Message;
            }

            if (content.msgtype === MsgType.File) {
              return {
                timeStamp: event.getTs(),
                sender: event.getSender(),
                content: content.body,
                msgtype: content.msgtype,
                mxcUrl: content.url,
                info: content.info,
              } as Message;
            }
            return null;
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

    const handleNewEvent = (
      event: MatrixEvent,
      _: any,
      toStartOfTimeline: boolean | undefined
    ) => {
      if (toStartOfTimeline) return;
      if (event.getType() === "m.room.message") {
        const content = event.getContent();
        if (content.msgtype === MsgType.Text) {
          const newMessage: Message = {
            timeStamp: event.getTs(),
            sender: event.getSender(),
            content: content.body,
            msgtype: content.msgtype,
            mxcUrl: undefined,
            info: undefined,
          };

          setMessages((prev) => [...prev, newMessage]);
        }

        if (content.msgtype === MsgType.File) {
          const newMessage: Message = {
            timeStamp: event.getTs(),
            sender: event.getSender(),
            content: content.body,
            msgtype: content.msgtype,
            mxcUrl: content.url,
            info: content.info,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      }
    };

    client.on(RoomEvent.Timeline, handleNewEvent);

    return () => {
      client.off(RoomEvent.Timeline, handleNewEvent);
    };
  }, [client, selectedRoomId]);

  // Check if the room is a direct message room
  useEffect(() => {
    if (!client || !selectedRoomId) return;
    const direct = isDirectRoomFunc(client, selectedRoomId);
    setIsDirectRoom(direct);
  }, [client, selectedRoomId]);

  // Scroll to the bottom when new messages arrive
  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  const checkIfFileImage = (mimetype?: string) => {
    if (!mimetype) return false;
    return mimetype.startsWith("image/");
  };
  // const checkIfFileVideo = (mimetype?: string) => {
  //   if (!mimetype) return false;
  //   return mimetype.startsWith("video/");
  // };
  // const checkIfFileAudio = (mimetype?: string) => {
  //   if (!mimetype) return false;
  //   return mimetype.startsWith("audio/");
  // };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${sizes[i]}`;
  };

  const downloadFile = async (mxcUrl: string | undefined, name: string) => {
    if (!mxcUrl || !client) return;
    const url = getCustomHttpForMxc(
      client.baseUrl,
      mxcUrl,
      client.getAccessToken() || ""
    );
    const response = await fetch(url);
    const blob = await response.blob();
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlBlob);
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
            <div className="text-center text-gray-500 my-2">
              {moment(message.timeStamp).format("DD.MM.YYYY")}
            </div>
          )}
          {isDirectRoom === true && renderDMMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message: Message) => (
    <div
      className={`${
        message.sender !== client?.getUserId() ? "text-left" : "text-right"
      }`}
    >
      {message.msgtype === MsgType.Text && (
        <div
          className={`${
            message.sender === client?.getUserId()
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.msgtype === MsgType.File && (
        <div
          className={`${
            message.sender === client?.getUserId()
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfFileImage(message.info?.mimetype) ? (
            <div
              className="flex gap-4 items-up cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageUrl(
                  getCustomHttpForMxc(
                    client?.baseUrl ?? "",
                    message.mxcUrl || "",
                    client?.getAccessToken() || ""
                  )
                );
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
                <span className="text-xs text-white/80 text-left">
                  {formatFileSize(message.info?.size)}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex gap-4 items-up cursor-pointer"
              onClick={() => downloadFile(message.mxcUrl, message.content)}
            >
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <div className="flex flex-col justify-start">
                <span>{message.content}</span>
                <span className="text-xs text-white/80 text-left">
                  {formatFileSize(message.info?.size)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timeStamp).format("HH:mm")}
      </div>
    </div>
  );

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto no-scrollbar p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
    >
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div
          className="fixed top-0 left-0 w-full h-full backdrop-blur-lg flex flex-col items-center justify-center z-[50]"
          onClick={() => {
            setShowImage(false);
            setImageUrl(null);
          }}
        >
          <img
            src={imageUrl ?? ""}
            alt="Preview"
            className="max-h-[100vh] max-w-[100vh] bg-cover"
          />
        </div>
      )}
    </div>
  );
}

export default MessageContainer;
