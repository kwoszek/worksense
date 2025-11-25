import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitContentWithBreaks(content?: string | null): string[] {
  if (!content) return [];
  return content.split(/(?:<br\s*\/?>|\r?\n)/gi);
}
