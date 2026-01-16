"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { productionLogger } from "@/lib/logger";

/**
 * Hook for safe navigation that prevents ChunkLoadError
 * by adding delays and prefetching chunks before navigation
 */
export function useSafeNavigation() {
  const router = useRouter();

  const safePush = useCallback(async (path: string, delayMs: number = 100) => {
    try {
      // Prefetch the target route to load chunks early
      router.prefetch(path);
      
      // Add delay to allow chunks to load
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Navigate to the target path
      router.push(path);
    } catch (error) {
      productionLogger.error("Safe navigation failed:", error);
      
      // Fallback: try with longer delay
      setTimeout(() => {
        router.push(path);
      }, 500);
    }
  }, [router]);

  const safeReplace = useCallback(async (path: string, delayMs: number = 100) => {
    try {
      router.prefetch(path);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      router.replace(path);
    } catch (error) {
      productionLogger.error("Safe replace failed:", error);
      setTimeout(() => {
        router.replace(path);
      }, 500);
    }
  }, [router]);

  return { safePush, safeReplace };
}
