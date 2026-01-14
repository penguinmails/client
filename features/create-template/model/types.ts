import { z } from "zod";
import { TemplateCategory } from "entities/template/model/types";

export const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.nativeEnum(TemplateCategory),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  description: z.string().optional(),
  folderId: z.number().nullable().optional(),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
