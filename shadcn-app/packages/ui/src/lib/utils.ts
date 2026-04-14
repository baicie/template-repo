import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * 支持条件类名和优先级合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
