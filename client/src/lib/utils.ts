import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const colors = [
//   "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]",
//   "bg-[#ffd60a2a] text-[#ffd60a] border-[1px] border-[#ffd60abb]",
//   "bg-[#06d6a02a] text-[#06d6a0] border-[1px] border-[#06d6a0bb]",
//   "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]",
// ];

// export const getColor = (color: number) => {
//   if (color >= 0 && color < colors.length) {
//     return colors[color];
//   }
//   return colors[0]; // Default color if out of range
// };

// export const color = "bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700 text-white border border-gray-600"; // Від світлого до темного сірого
// export const color = "bg-gradient-to-br from-[#d4d4d4] via-[#a3a3a3] to-[#4b4b4b] text-white border border-[#6b6b6b]"; //  Металічний стиль
// export const color = "bg-gradient-to-tr from-zinc-200 via-zinc-400 to-zinc-600 text-black border border-zinc-500"; // Димчатий ефект
export const color = "bg-gradient-to-br from-neutral-700 via-neutral-600 to-neutral-800 text-white border border-neutral-500"; // Темна сталь
// export const color = "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 text-white border border-slate-500"; // Світлий графіт

export const getColor = () => {
  return color;
};