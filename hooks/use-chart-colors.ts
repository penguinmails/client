import { useEffect, useState } from "react";

/**
 * Hook to resolve CSS variable values at runtime.
 * Useful for libraries like Recharts that don't handle CSS variables in SVGs.
 * 
 * @param cssVariable - CSS variable name without var(), e.g., "--destructive"
 * @param fallback - Fallback color if variable can't be resolved
 * @returns The resolved color value
 */
export function useCssVariable(cssVariable: string, fallback: string): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const resolveColor = () => {
      try {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const value = computedStyle.getPropertyValue(cssVariable).trim();
        
        if (value) {
          // Check if value is already a valid color format
          if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || value.startsWith("oklch")) {
            setColor(value);
          } else if (value.includes(" ")) {
            // Try to detect format based on values
            // oklch format: "0.5 0.2 250" (lightness chroma hue)
            // hsl format: "220 90% 56%" (hue saturation lightness)
            const parts = value.split(" ");
            if (parts.length === 3) {
              // Check if it looks like oklch (first value usually < 1 or has decimal)
              const firstPart = parseFloat(parts[0]);
              if (firstPart <= 1 && !parts[0].includes("%")) {
                setColor(`oklch(${value})`);
              } else {
                setColor(`hsl(${value})`);
              }
            } else {
              // Use fallback for unexpected format
              setColor(fallback);
            }
          } else {
            // Single value without spaces, use as-is
            setColor(value);
          }
        } else {
          // No value found, use fallback
          setColor(fallback);
        }
      } catch {
        // If any error occurs, use fallback
        setColor(fallback);
      }
    };

    resolveColor();

    // Re-resolve when theme changes (observing class changes on html element)
    const observer = new MutationObserver(resolveColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [cssVariable, fallback]);

  return color;
}

/**
 * Chart color constants for Recharts.
 * Using direct hex values for reliability with SVG rendering.
 */
const CHART_COLORS = {
  blue: "#2563eb",      // chart-1 / totalWarmups
  green: "#16a34a",     // chart-2 / replies
  yellow: "#eab308",    // chart-3
  purple: "#8b5cf6",    // chart-4
  pink: "#ec4899",      // chart-5
  red: "#dc2626",       // destructive / spamFlags
} as const;

/**
 * Hook to get chart colors that work with Recharts.
 * Returns reliable hex colors for SVG rendering.
 */
export function useChartColors() {
  return {
    destructive: CHART_COLORS.red,
    chart1: CHART_COLORS.blue,
    chart2: CHART_COLORS.green,
    chart3: CHART_COLORS.yellow,
    chart4: CHART_COLORS.purple,
    chart5: CHART_COLORS.pink,
    // Semantic aliases for warmup chart
    totalWarmups: CHART_COLORS.blue,
    spamFlags: CHART_COLORS.red,
    replies: CHART_COLORS.green,
  };
}

