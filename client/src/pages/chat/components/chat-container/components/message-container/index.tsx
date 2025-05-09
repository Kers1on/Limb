import { useMatrix } from "@/lib/matrixContext";
import { AccountDataEvents, MatrixEvent, RoomEvent } from "matrix-js-sdk";
import { useEffect, useRef, useState } from "react";
import moment from "moment";

interface Message {
  timeStamp: number;
  sender: string | undefined;
  content: string;
  msgtype: string;
}

function MessageContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { client, selectedRoomId } = useMatrix();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDirectRoom, setIsDirectRoom] = useState<boolean | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get old messages when scrolling to the top
  // No-Tested
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
              if (content.msgtype === "m.text") {
                return {
                  timeStamp: event.getTs(),
                  sender: event.getSender(),
                  content: content.body,
                  msgtype: content.msgtype,
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
            if (content.msgtype === "m.text") {
              return {
                timeStamp: event.getTs(),
                sender: event.getSender(),
                content: content.body,
                msgtype: content.msgtype,
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
        if (content.msgtype === "m.text") {
          const newMessage: Message = {
            timeStamp: event.getTs(),
            sender: event.getSender(),
            content: content.body,
            msgtype: content.msgtype,
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

    const room = client.getRoom(selectedRoomId);
    if (!room) return;

    const dmMap = client
      .getAccountData("m.direct" as keyof AccountDataEvents)
      ?.getContent() as Record<string, string[]>;

    let direct = false;
    if (dmMap) {
      for (const [_, roomIds] of Object.entries(dmMap)) {
        if (roomIds.includes(selectedRoomId)) {
          direct = true;
          break;
        }
      }
    }

    setIsDirectRoom(direct);
  }, [client, selectedRoomId]);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
      {message.msgtype === "m.text" && (
        <div
          className={`${
            message.sender === client?.getUserId()
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
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
      className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
    >
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
}

export default MessageContainer;
