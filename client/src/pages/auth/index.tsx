import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { useState } from "react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMatrix } from "@/lib/matrixContext";
import { createClient, ClientEvent } from "matrix-js-sdk";
import { login, register } from "@/lib/matrixAuthService";

const Auth = () => {
  const navigate = useNavigate();
  const { setClient, setIsClientReady } = useMatrix();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateLogin = () => {
    if (!username.length) {
      toast.error("Username is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const validateRegistration = () => {
    if (!username.length) {
      toast.error("Username is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const clientData = await login(username, password);

        if (clientData) {
          const client = createClient({
            baseUrl: clientData.baseUrl,
            accessToken: clientData.accessToken,
            userId: clientData.userId,
            deviceId: clientData.deviceId,
            useAuthorizationHeader: true,
          });

          client.once(ClientEvent.Sync, (state) => {
            if (state === "PREPARED") {
              setIsClientReady(true);
            }
          });

          client.startClient();
          setClient(client);
          navigate("/profile");
        } else {
          throw new Error("Client is not initialized");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login failed");
      }
    }
  };

  const handleRegistration = async () => {
    if (validateRegistration()) {
      try {
        const clientData = await register(username, password, confirmPassword);

        if (clientData) {
          const client = createClient({
            baseUrl: clientData.baseUrl,
            accessToken: clientData.accessToken,
            userId: clientData.userId,
            deviceId: clientData.deviceId,
            useAuthorizationHeader: true,
          });

          client.once(ClientEvent.Sync, (state) => {
            if (state === "PREPARED") {
              setIsClientReady(true);
            }
          });

          client.startClient();
          client.joinRoom("!hgmQxZqDMihGSKTHlk:localhost"); // Join a public room for indexation
          setClient(client);
          navigate("/profile");
        }
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed");
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vh] flex items-center justify-center m-auto">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300 cursor-pointer"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300 cursor-pointer"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-6" value="login">
                <Input
                  placeholder="Username"
                  type="text"
                  className="rounded-full p-6"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="rounded-full p-6 cursor-pointer"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5 mt-6" value="signup">
                <Input
                  placeholder="Username"
                  type="text"
                  className="rounded-full p-6"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="ConfirmPassword"
                  type="password"
                  className="rounded-full p-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  className="rounded-full p-6 cursor-pointer"
                  onClick={handleRegistration}
                >
                  Register
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="Background Login" className="h-[700px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
