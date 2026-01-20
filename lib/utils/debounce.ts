/**
 * Debounce Utility
 * 
 * Delays function execution until after wait period has elapsed.
 * Part of the FSD shared layer.
 */

/**
 * Creates a debounced version of a function
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 * 
 * @example
 * const debouncedSearch = debounce((query: string) => search(query), 300);
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
