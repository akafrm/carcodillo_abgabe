/**
 * Utility Functions
 * General-purpose utilities for the application.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges and deduplicates Tailwind CSS classes
 * 
 * Uses clsx to merge class values and tailwind-merge to handle
 * Tailwind-specific class conflicts and deduplication.
 * 
 * @param inputs - Any number of class values (strings, objects, arrays)
 * @returns Optimized class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
    }
    