import { useEffect, useRef, useState } from "react";
import { useMatrix } from "@/lib/matrixContext";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCustomHttpForMxc } from "@/lib/clientDataService";

const Profile = () => {
  const navigate = useNavigate();
  const { client } = useMatrix();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [hovered, setHovered] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateProfile = () => {
    if (!displayName.length) {
      toast.error("Display name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        if (client) {
          await client.setDisplayName(displayName);
          toast.success("Profile updated successfully");
        } else {
          toast.error("Matrix client is not ready yet.");
        }
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile");
      }
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!client) {
        toast.error("Matrix client is not ready yet.");
        return;
      }

      const response = await client.uploadContent(file);

      const mxcUrl = response.content_uri;

      await client.setAvatarUrl(mxcUrl);
      setImage(URL.createObjectURL(file));

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Failed to update profile image:", error);
      toast.error("Failed to update profile image");
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (!client) {
        toast.error("Matrix client is not ready yet.");
        return;
      }

      await client.setAvatarUrl("");
      setImage(null);
      toast.success("Profile image deleted successfully");
    } catch (error) {
      console.error("Failed to delete profile image:", error);
      toast.error("Failed to delete profile image");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div>
          <IoArrowBack
            className="text-4xl lg:text-6xl text-white/90 cursor-pointer"
            onClick={() => navigate("/chat")}
          />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor()}`}
                >
                  {displayName
                    ? displayName.charAt(0).toUpperCase()
                    : userId?.charAt(1).toUpperCase()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="User ID"
                type="text"
                disabled
                value={userId ? userId : ""}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Display Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300 cursor-pointer"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
