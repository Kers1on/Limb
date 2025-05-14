import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatContainer = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#1c1d25] flex flex-col md:static md:flex-1 border-l border-[#2a2b33] transition-all duration-500">
      <ChatHeader />
      <MessageContainer />
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
