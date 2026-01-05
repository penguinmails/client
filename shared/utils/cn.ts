/**
 * Class Name Utility
 * 
 * Combines clsx and tailwind-merge for conditional class names.
 * Part of the FSD shared layer.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes
 * 
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'rounded')
 * // => 'px-2 py-1 bg-blue-500 rounded'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
