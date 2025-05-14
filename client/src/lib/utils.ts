import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import animationData from "@/assets/Animation - 1747241255213.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const color = "bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700 text-white border border-gray-600"; // Від світлого до темного сірого
// export const color = "bg-gradient-to-br from-[#d4d4d4] via-[#a3a3a3] to-[#4b4b4b] text-white border border-[#6b6b6b]"; //  Металічний стиль
export const color = "bg-gradient-to-tr from-zinc-200 via-zinc-400 to-zinc-600 text-black border border-zinc-500"; // Димчатий ефект
// export const color = "bg-gradient-to-br from-neutral-700 via-neutral-600 to-neutral-800 text-white border border-neutral-500"; // Темна сталь
// export const color = "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 text-white border border-slate-500"; // Світлий графіт

export const getColor = () => {
  return color;
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
}