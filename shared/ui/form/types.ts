// Form Types
export interface FormFieldContextValue<
  TFieldValues extends
    import("react-hook-form").FieldValues = import("react-hook-form").FieldValues,
  TName extends
    import("react-hook-form").FieldPath<TFieldValues> = import("react-hook-form").FieldPath<TFieldValues>,
> {
  name: TName;
}

export type FormItemContextValue = {
  id: string;
};
