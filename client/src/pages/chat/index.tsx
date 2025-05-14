import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
import { useMatrix } from "@/lib/matrixContext";

const Chat = () => {
  const {
    selectedRoomId,
    isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,
  } = useMatrix();

  return (
    <div className="flex h-screen text-white overflow-hidden bg-[#0d0d0d]">
      {(isUploading || isDownloading) && (
        <div className="h-full w-full fixed top-0 left-0 z-10 bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-center flex-col gap-6">
          <h5 className="text-4xl lg:text-5xl text-[#9333ea] animate-pulse drop-shadow-[0_0_10px_#9333ea88]">
            {isUploading ? "Uploading File" : "Downloading File"}
          </h5>
          <div className="w-48 h-4 bg-[#1b1c24] rounded-full border border-[#9333ea] overflow-hidden">
            <div
              className="h-full bg-[#9333ea] transition-all duration-300"
              style={{
                width: `${
                  isUploading ? fileUploadProgress : fileDownloadProgress
                }%`,
              }}
            ></div>
          </div>
          <span className="text-[#c084fc] text-lg font-mono">
            {isUploading ? fileUploadProgress : fileDownloadProgress}%
          </span>
        </div>
      )}

      <ContactsContainer />
      {selectedRoomId ? <ChatContainer /> : <EmptyChatContainer />}
    </div>
  );
};

export default Chat;
