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
          client.joinRoom("!fMgVAkcyBNHXIYcDZI:localhost"); // Join a public room for indexation
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
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a2e] to-[#000000] flex items-center justify-center font-mono text-white">
      {/* Grid background animation */}
      <div className="absolute inset-0 z-0 grid-animated"></div>

      {/* Login Box */}
      <div className="relative z-10 w-[95vw] md:w-[85vw] lg:w-[70vw] xl:w-[60vw] h-[90vh] bg-[#13131a] bg-opacity-80 border border-[#2a2a40] shadow-[0_0_40px_#9333ea33] rounded-2xl grid xl:grid-cols-2 overflow-hidden backdrop-blur-md">
        <div className="flex flex-col gap-8 justify-center px-10 py-12">
          <div className="text-left space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-[#a855f7]">
              Limb Access
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Enter the decentralized gateway
            </p>
          </div>

          <Tabs className="w-full" defaultValue="login">
            <TabsList className="w-full flex border-b border-[#3b3b4f]">
              <TabsTrigger
                value="login"
                className="w-full text-sm p-3 tracking-wide uppercase data-[state=active]:text-[#9333ea] data-[state=active]:border-b-2 data-[state=active]:border-[#9333ea] text-gray-400"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="w-full text-sm p-3 tracking-wide uppercase data-[state=active]:text-[#9333ea] data-[state=active]:border-b-2 data-[state=active]:border-[#9333ea] text-gray-400"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent className="flex flex-col gap-4 mt-6" value="login">
              <Input
                placeholder="Username"
                type="text"
                className="bg-[#1e1e2e] border border-[#383856] text-white p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="bg-[#1e1e2e] border border-[#383856] text-white p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="bg-[#9333ea] hover:bg-[#6b21a8] transition-all p-4 rounded-md text-white tracking-wide cursor-pointer"
                onClick={handleLogin}
              >
                Login
              </Button>
            </TabsContent>

            <TabsContent className="flex flex-col gap-4 mt-6" value="signup">
              <Input
                placeholder="Username"
                type="text"
                className="bg-[#1e1e2e] border border-[#383856] text-white p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="bg-[#1e1e2e] border border-[#383856] text-white p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="bg-[#1e1e2e] border border-[#383856] text-white p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                className="bg-[#9333ea] hover:bg-[#6b21a8] transition-all p-4 rounded-md text-white tracking-wide cursor-pointer"
                onClick={handleRegistration}
              >
                Register
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden xl:flex items-center justify-center relative">
          <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#9333ea66] to-transparent animate-pulse-slow blur-3xl" />
          <div className="absolute text-center text-gray-400 text-sm tracking-widest px-8">
            <p className="uppercase">Powering the decentralized future</p>
            <p className="mt-2 text-[#a855f7]">[matrix] Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
