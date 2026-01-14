import { VariantProps } from "class-variance-authority";

// Button Types
export type ButtonVariants = VariantProps<
  typeof import("@/components/ui/button/button").buttonVariants
>;
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "info"
  | "muted";
export type ButtonSize = "default" | "sm" | "lg" | "icon";
