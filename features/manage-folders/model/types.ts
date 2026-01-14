import { z } from "zod";

export const newFolderFormSchema = z.object({
  folderName: z.string().min(1, "Folder name is required"),
});
