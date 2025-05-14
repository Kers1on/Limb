import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "lottie-react";

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 hidden md:flex flex-col justify-center items-center bg-[#1c1d25] transition-all duration-1000">
      <Lottie
        animationData={animationDefaultOptions.animationData}
        loop={animationDefaultOptions.loop}
        autoplay={animationDefaultOptions.autoplay}
        style={{
          width: "400px",
          height: "400px",
          filter: "drop-shadow(0 0 20px #9333ea)",
        }}
      />
      <div className="mt-10 text-center flex flex-col gap-5 text-white text-opacity-90 transition-all duration-300">
        <h3 className="text-3xl lg:text-4xl font-semibold poppins-medium">
          Welcome to<span className="text-[#a855f7]"> Limb </span>
        </h3>
        <p className="text-base lg:text-lg text-[#a1a1aa] max-w-xl">
          Select a contact or group to start messaging ✨
        </p>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
