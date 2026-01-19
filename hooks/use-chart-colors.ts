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
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const value = computedStyle.getPropertyValue(cssVariable).trim();
      
      if (value) {
        // If the value is in oklch or hsl format, wrap it appropriately
        if (value.includes(" ")) {
          // Assume it's space-separated values like "0 84.2% 60.2%"
          setColor(`hsl(${value})`);
        } else {
          setColor(value);
        }
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
  }, [cssVariable]);

  return color;
}

/**
 * Hook to get chart colors that work with Recharts.
 * Resolves CSS variables to actual color values.
 */
export function useChartColors() {
  const destructive = useCssVariable("--destructive", "#dc2626");
  const chart1 = useCssVariable("--chart-1", "#2563eb");
  const chart2 = useCssVariable("--chart-2", "#16a34a");
  const chart3 = useCssVariable("--chart-3", "#eab308");
  const chart4 = useCssVariable("--chart-4", "#8b5cf6");
  const chart5 = useCssVariable("--chart-5", "#ec4899");

  return {
    destructive,
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,
    // Semantic aliases for warmup chart
    totalWarmups: chart1,
    spamFlags: destructive,
    replies: chart2,
  };
}
