"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { formTokens } from "@/lib/config/design-tokens";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ 
  className, 
  variant = "default",
  ...props 
}: React.ComponentProps<"div"> & {
  variant?: "default" | "compact";
}) {
  const id = React.useId();
  const spacing = variant === "compact" ? formTokens.spacing.fieldGap : formTokens.spacing.sectionGap;

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn(spacing, className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  variant?: "default" | "required";
}) {
  const { error, formItemId } = useFormField();
  
  const labelClasses = cn(
    formTokens.sizes.default.label,
    error ? formTokens.states.error.label : formTokens.states.default.label,
    className
  );

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      data-required={variant === "required"}
      className={labelClasses}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ 
  className,
  ...props 
}: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      className={cn(
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}

function FormDescription({ 
  className, 
  variant = "default",
  ...props 
}: React.ComponentProps<"p"> & {
  variant?: "default" | "help" | "warning";
}) {
  const { formDescriptionId } = useFormField();
  
  const descriptionClasses = cn(
    formTokens.sizes.default.description,
    variant === "warning" && "text-orange-600 dark:text-orange-400",
    variant === "help" && "text-muted-foreground",
    className
  );

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={descriptionClasses}
      {...props}
    />
  );
}

function FormMessage({ 
  className, 
  variant = "error",
  ...props 
}: React.ComponentProps<"p"> & {
  variant?: "error" | "success" | "warning";
}) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  const messageClasses = cn(
    formTokens.sizes.default.message,
    variant === "error" && "text-destructive",
    variant === "success" && "text-green-600 dark:text-green-400",
    variant === "warning" && "text-orange-600 dark:text-orange-400",
    className
  );

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={messageClasses}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  formTokens,
};