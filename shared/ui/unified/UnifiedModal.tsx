import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/shared/utils";
import { 
  getModalVariants,
  getModalHeaderVariants,
  type ModalSize,
  type ComponentVariantProps 
} from "@/shared/config/component-variants";

export interface UnifiedModalProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  size?: ModalSize;
}

export interface UnifiedModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    ComponentVariantProps {
  size?: ModalSize;
  showClose?: boolean;
}

export interface UnifiedModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

const UnifiedModal = DialogPrimitive.Root;

const UnifiedModalTrigger = DialogPrimitive.Trigger;

const UnifiedModalPortal = DialogPrimitive.Portal;

const UnifiedModalClose = DialogPrimitive.Close;

const UnifiedModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));

const UnifiedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  UnifiedModalContentProps
>(({ className, children, size = "default", showClose = true, ...props }, ref) => {
  const modalClasses = getModalVariants({
    size,
    className,
  });

  return (
    <UnifiedModalPortal>
      <UnifiedModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          modalClasses,
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2 duration-200"
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </UnifiedModalPortal>
  );
});

const UnifiedModalHeader = React.forwardRef<HTMLDivElement, UnifiedModalHeaderProps>(
  ({ className, bordered = false, ...props }, ref) => {
    const headerClasses = getModalHeaderVariants({
      variant: bordered ? 'bordered' : 'default',
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

const UnifiedModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }>(
  ({ className, bordered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        bordered && "border-t pt-4 mt-4",
        className
      )}
      {...props}
    />
  )
);

const UnifiedModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

const UnifiedModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

const UnifiedModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
);

UnifiedModalOverlay.displayName = DialogPrimitive.Overlay.displayName;
UnifiedModalContent.displayName = DialogPrimitive.Content.displayName;
UnifiedModalHeader.displayName = "UnifiedModalHeader";
UnifiedModalFooter.displayName = "UnifiedModalFooter";
UnifiedModalTitle.displayName = DialogPrimitive.Title.displayName;
UnifiedModalDescription.displayName = DialogPrimitive.Description.displayName;
UnifiedModalBody.displayName = "UnifiedModalBody";

export {
  UnifiedModal,
  UnifiedModalPortal,
  UnifiedModalOverlay,
  UnifiedModalTrigger,
  UnifiedModalClose,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalFooter,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalBody,
};