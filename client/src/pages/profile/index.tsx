import { useEffect, useRef, useState } from "react";
import { useMatrix } from "@/lib/matrixContext";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
    <div className="bg-[#0d0d0d] h-screen w-screen flex items-center justify-center">
      <div className="bg-[#1b1c24] border border-[#9333ea] rounded-2xl shadow-[0_0_30px_#9333ea66] p-10 w-[90vw] max-w-4xl flex flex-col gap-10">
        <div>
          <IoArrowBack
            className="text-4xl lg:text-5xl text-[#a78bfa] cursor-pointer transition-all hover:text-[#c084fc]"
            onClick={() => navigate("/chat")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Аватар */}
          <div
            className="w-full flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative w-32 h-32 md:w-48 md:h-48">
              <Avatar className="w-full h-full rounded-full overflow-hidden border-[2px] border-[#9333ea] shadow-[0_0_15px_#9333ea66]">
                {image ? (
                  <AvatarImage
                    src={image}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`w-full h-full text-5xl flex items-center justify-center rounded-full bg-[#121219] text-[#d8b4fe]`}
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
                    <FaTrash className="text-white text-3xl" />
                  ) : (
                    <FaPlus className="text-white text-3xl" />
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
          </div>

          {/* Інпути + кнопка */}
          <div className="flex flex-col gap-5 justify-center text-white">
            <Input
              placeholder="User ID"
              type="text"
              disabled
              value={userId ? userId : ""}
              className="rounded-lg p-6 bg-[#1e1e2e] border border-[#5b21b6] text-white focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
            />
            <Input
              placeholder="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg p-6 bg-[#1e1e2e] border border-[#5b21b6] text-white focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
            />
            <Button
              className="mt-4 h-14 bg-[#9333ea] hover:bg-[#6b21a8] transition-all duration-300 rounded-lg shadow-[0_0_15px_#9333ea77] cursor-pointer"
              onClick={saveChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
