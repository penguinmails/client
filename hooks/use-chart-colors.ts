import { useEffect, useState, useCallback } from "react";

/**
 * Type for chart colors.
 */
type ChartColors = {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  destructive: string;
};

/**
 * Chart color constants that match the design system.
 * These are used as fallbacks and for direct use when CSS variables
 * cannot be resolved (e.g., in SVG contexts like Recharts).
 */
const CHART_COLORS: ChartColors = {
  chart1: "#2563eb", // Blue - Total Warmups
  chart2: "#16a34a", // Green - Replies
  chart3: "#eab308", // Yellow
  chart4: "#8b5cf6", // Purple
  chart5: "#ec4899", // Pink
  destructive: "#dc2626", // Red - Spam Flags
};

/**
 * Hook to get chart colors that work with Recharts.
 * Uses theme-aware colors by reading computed CSS colors.
 */
export function useChartColors() {
  const [colors, setColors] = useState<ChartColors>(CHART_COLORS);

  const resolveColors = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Try to get actual rendered colors from a test element
    // This works with any color format (oklch, hsl, hex, etc.)
    const testElement = document.createElement("div");
    testElement.style.cssText = "position:absolute;visibility:hidden;";
    document.body.appendChild(testElement);
    
    const resolveColor = (cssVar: string, fallback: string): string => {
      testElement.style.color = `var(${cssVar})`;
      const computed = getComputedStyle(testElement).color;
      // If we get a valid rgb/rgba color, convert to hex
      if (computed && computed !== "rgba(0, 0, 0, 0)" && computed.startsWith("rgb")) {
        return rgbToHex(computed);
      }
      return fallback;
    };
    
    const newColors = {
      chart1: resolveColor("--chart-1", CHART_COLORS.chart1),
      chart2: resolveColor("--chart-2", CHART_COLORS.chart2),
      chart3: resolveColor("--chart-3", CHART_COLORS.chart3),
      chart4: resolveColor("--chart-4", CHART_COLORS.chart4),
      chart5: resolveColor("--chart-5", CHART_COLORS.chart5),
      destructive: resolveColor("--destructive", CHART_COLORS.destructive),
    };
    
    document.body.removeChild(testElement);
    setColors(newColors);
  }, []);

  useEffect(() => {
    resolveColors();

    // Re-resolve when theme changes
    const observer = new MutationObserver(resolveColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [resolveColors]);

  return {
    ...colors,
    // Semantic aliases for warmup chart
    totalWarmups: colors.chart1,
    spamFlags: colors.destructive,
    replies: colors.chart2,
  };
}

/**
 * Convert rgb/rgba string to hex color.
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
