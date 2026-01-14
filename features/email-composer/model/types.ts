import { PersonalizationTag } from "entities/template";
// Email composition types
export interface EmailComposition {
  subject: string;
  body: string;
  bodyHtml?: string;
  personalizationTags: PersonalizationTag[];
}
