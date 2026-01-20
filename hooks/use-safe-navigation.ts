"use client";

import { useCallback } from "react";
import { useRouter } from "@/lib/config/i18n/navigation";
import { productionLogger } from "@/lib/logger";

/**
 * Hook for safe navigation that prevents ChunkLoadError
 * by adding delays and prefetching chunks before navigation
 */
export function useSafeNavigation() {
  const router = useRouter();

  // Helper to strip locale prefix if it exists to prevent double-prefixing
  // e.g. /es/dashboard -> /dashboard
  const getLocaleFreePath = useCallback((path: string) => {
    if (!path) return path;
    if (path.startsWith('/es/')) return path.replace('/es/', '/');
    if (path.startsWith('/en/')) return path.replace('/en/', '/');
    return path;
  }, []);

  const safePush = useCallback(async (path: string, delayMs: number = 100) => {
    const targetPath = getLocaleFreePath(path);
    try {
      // Prefetch the target route to load chunks early
      router.prefetch(targetPath);
      
      // Add delay to allow chunks to load
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Navigate to the target path
      router.push(targetPath);
    } catch (error) {
      productionLogger.error("Safe navigation failed:", error);
      
      // Fallback: try with longer delay
      setTimeout(() => {
        router.push(targetPath);
      }, 500);
    }
  }, [router, getLocaleFreePath]);

  const safeReplace = useCallback(async (path: string, delayMs: number = 100) => {
    const targetPath = getLocaleFreePath(path);
    try {
      router.prefetch(targetPath);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      router.replace(targetPath);
    } catch (error) {
      productionLogger.error("Safe replace failed:", error);
      setTimeout(() => {
        router.replace(targetPath);
      }, 500);
    }
  }, [router, getLocaleFreePath]);

  return { safePush, safeReplace };
}
