import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCustomHttpForMxc } from "@/lib/avatarMaxToHttp";
import { useMatrix } from "@/lib/matrixContext";
import { clearSession } from "@/lib/storageSession";
import { getColor } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function ProfileInfo() {
  const navigate = useNavigate();
  const { client, setClient } = useMatrix();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!client) {
        console.log("Matrix client is not ready yet.");
        return;
      }

      try {
        const userId = await client.getUserId();
        setUserId(userId);

        if (userId) {
          const profileInfo = await client.getProfileInfo(userId);

          if (profileInfo.displayname) {
            setDisplayName(profileInfo.displayname);
          }

          if (profileInfo.avatar_url) {
            const avatarUrl = getCustomHttpForMxc(
              client.baseUrl,
              profileInfo.avatar_url,
              client.getAccessToken() || ""
            );

            setImage(avatarUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };

    fetchData();
  }, [client]);

  const logOut = async () => {
    try {
      if (client) {
        await client.logout();
        clearSession();
        navigate("/auth");
        setClient(null);
      } else {
        console.error("Matrix client is not available.");
      }
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {image ? (
              <AvatarImage
                src={image}
                alt="Profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor()}`}
              >
                {displayName
                  ? displayName.charAt(0).toUpperCase()
                  : userId?.charAt(1).toUpperCase()}
              </div>
            )}
          </Avatar>
        </div>
        <div>{displayName ? displayName : userId?.split(":")[0]}</div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                className="text-purple-500 text-xl font-medium cursor-pointer"
                onClick={() => {
                  navigate("/profile");
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              Edit Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp
                className="text-red-500 text-xl font-medium cursor-pointer"
                onClick={() => {
                  logOut();
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default ProfileInfo;
