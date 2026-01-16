import * as React from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getSpinnerVariants,
  type SpinnerSize,
  type SpinnerVariant,
  type ComponentVariantProps 
} from "@/lib/config/component-variants";

export interface UnifiedLoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentVariantProps {
  /** Size variant */
  size?: SpinnerSize;
  /** Visual variant */
  variant?: SpinnerVariant;
  /** Custom icon to use instead of default spinner */
  icon?: LucideIcon;
  /** Loading text to display */
  text?: string;
  /** Show text below spinner */
  showText?: boolean;
  /** Center the spinner in its container */
  centered?: boolean;
  /** Overlay mode (covers parent container) */
  overlay?: boolean;
}

/**
 * Unified Loading Spinner component for consistent loading states.
 * Consolidates all loading spinner implementations across the application.
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <UnifiedLoadingSpinner />
 *
 * // With text
 * <UnifiedLoadingSpinner 
 *   text="Loading campaigns..." 
 *   showText 
 * />
 *
 * // Overlay mode
 * <UnifiedLoadingSpinner 
 *   overlay 
 *   text="Saving changes..." 
 *   showText 
 * />
 *
 * // Custom size and variant
 * <UnifiedLoadingSpinner 
 *   size="lg" 
 *   variant="primary" 
 * />
 * ```
 */
const UnifiedLoadingSpinner = React.forwardRef<HTMLDivElement, UnifiedLoadingSpinnerProps>(
  ({ 
    className,
    size = "default",
    variant = "default",
    icon: CustomIcon,
    text = "Loading...",
    showText = false,
    centered = false,
    overlay = false,
    ...props 
  }, ref) => {
    const Icon = CustomIcon || Loader2;
    
    const spinnerClasses = getSpinnerVariants({
      variant,
      size,
      className: cn(
        "animate-spin",
        CustomIcon ? "" : "animate-spin" // Only add animate-spin if using default Loader2
      ),
    });

    const containerClasses = cn(
      "flex items-center gap-2",
      centered && "justify-center",
      showText ? "flex-col" : "flex-row",
      overlay && [
        "absolute inset-0 z-50",
        "bg-background/80 backdrop-blur-sm",
        "flex items-center justify-center"
      ],
      className
    );

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="status"
        aria-label={text}
        {...props}
      >
        <Icon className={spinnerClasses} />
        {showText && (
          <span className={cn(
            "text-sm text-muted-foreground",
            size === "sm" && "text-xs",
            size === "lg" && "text-base"
          )}>
            {text}
          </span>
        )}
        <span className="sr-only">{text}</span>
      </div>
    );
  }
);

UnifiedLoadingSpinner.displayName = "UnifiedLoadingSpinner";

export { UnifiedLoadingSpinner };