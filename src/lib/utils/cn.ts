// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge Tailwind + conditional classNames cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}