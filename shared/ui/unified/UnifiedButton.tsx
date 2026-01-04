import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

import { cn } from "@/shared/utils";
import { 
  getButtonVariants, 
  type ButtonVariant, 
  type ButtonSize,
  type ComponentVariantProps 
} from "@/shared/config/component-variants";

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ComponentVariantProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  /** Makes the button circular (for icon-only buttons) */
  rounded?: boolean;
  /** Floating action button style */
  floating?: boolean;
  /** Icon-only button (automatically applies appropriate sizing) */
  iconOnly?: boolean;
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    asChild = false,
    loading = false,
    loadingText,
    disabled,
    children,
    icon,
    iconPosition = 'left',
    rounded = false,
    floating = false,
    iconOnly = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    // Adjust size for icon-only buttons
    const effectiveSize = iconOnly ? (
      size === 'default' ? 'icon' : 
      size === 'sm' ? 'iconSm' : 
      size === 'lg' ? 'iconLg' : 
      size
    ) : size;
    
    const buttonClasses = getButtonVariants({
      variant,
      size: effectiveSize,
      disabled: isDisabled,
      loading,
      className: cn(
        // Rounded styling
        rounded && "rounded-full",
        // Floating action button styling
        floating && [
          "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105",
          "rounded-full"
        ],
        // Icon-only specific styling
        iconOnly && "p-0",
        className
      ),
    });

    // Content rendering logic
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className={cn(
              "animate-spin",
              iconOnly ? "h-4 w-4" : "mr-2 h-4 w-4"
            )} />
            {!iconOnly && (loadingText || children)}
          </>
        );
      }

      if (iconOnly) {
        return icon || children;
      }

      return (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2 flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2 flex-shrink-0">{icon}</span>
          )}
        </>
      );
    };

    return (
      <Comp
        className={cn(buttonClasses)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </Comp>
    );
  }
);

UnifiedButton.displayName = "UnifiedButton";

export { UnifiedButton };