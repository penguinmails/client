import * as React from "react";

import { cn } from "@/shared/utils";
import { 
  getCardVariants,
  getCardHeaderVariants,
  getCardTitleVariants,
  type CardVariant,
  type CardSize,
  type ComponentVariantProps 
} from "@/shared/config/component-variants";

export interface UnifiedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentVariantProps {
  variant?: CardVariant;
  size?: CardSize;
}

export interface UnifiedCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  withAction?: boolean;
}

export interface UnifiedCardTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: CardSize;
}

const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const cardClasses = getCardVariants({
      variant,
      size,
      className,
    });

    return (
      <div
        ref={ref}
        className={cn(cardClasses)}
        {...props}
      />
    );
  }
);

const UnifiedCardHeader = React.forwardRef<HTMLDivElement, UnifiedCardHeaderProps>(
  ({ className, bordered = false, withAction = false, ...props }, ref) => {
    const headerClasses = getCardHeaderVariants({
      variant: withAction ? 'withAction' : bordered ? 'bordered' : 'default',
      className,
    });

    return (
      <div
        ref={ref}
        className={cn(headerClasses)}
        {...props}
      />
    );
  }
);

const UnifiedCardTitle = React.forwardRef<HTMLDivElement, UnifiedCardTitleProps>(
  ({ className, size = "default", ...props }, ref) => {
    const titleClasses = getCardTitleVariants({
      size,
      className,
    });

    return (
      <div
        ref={ref}
        className={cn(titleClasses)}
        {...props}
      />
    );
  }
);

const UnifiedCardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
);

const UnifiedCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6", className)}
      {...props}
    />
  )
);

const UnifiedCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }>(
  ({ className, bordered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-6",
        bordered && "border-t pt-6",
        className
      )}
      {...props}
    />
  )
);

const UnifiedCardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
);

UnifiedCard.displayName = "UnifiedCard";
UnifiedCardHeader.displayName = "UnifiedCardHeader";
UnifiedCardTitle.displayName = "UnifiedCardTitle";
UnifiedCardDescription.displayName = "UnifiedCardDescription";
UnifiedCardContent.displayName = "UnifiedCardContent";
UnifiedCardFooter.displayName = "UnifiedCardFooter";
UnifiedCardAction.displayName = "UnifiedCardAction";

export {
  UnifiedCard,
  UnifiedCardHeader,
  UnifiedCardTitle,
  UnifiedCardDescription,
  UnifiedCardContent,
  UnifiedCardFooter,
  UnifiedCardAction,
};