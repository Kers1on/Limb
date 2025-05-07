import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
import { useMatrix } from "@/lib/matrixContext";

const Chat = () => {
  const { selectedRoomId } = useMatrix();
  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      <ContactsContainer />
      {selectedRoomId ? (
        // <ChatContainer roomId={selectedRoomId} />
        <ChatContainer />
      ) : (
        <EmptyChatContainer />
      )}
    </div>
  );
};

export default Chat;
