"use server";

import { initialTemplates as initialTemplatesMock } from "@/lib/data/template.mock";
import { getCurrentUserId } from "@/lib/utils/auth";
import type { Template, TemplateFolder, TemplateCategoryType } from "@/types";
import type { ActionResult } from "./settings.types";
import { ERROR_CODES } from "./settings.types";

// Use the actual type inference from mock data
type MockTemplateType = typeof initialTemplatesMock[0];

// Type-safe category mapping
function mapCategoryStringToType(categoryString: string): TemplateCategoryType {
  const categoryMap: Record<string, TemplateCategoryType> = {
    "Cold Outreach": "OUTREACH",
    "Follow-ups": "FOLLOW_UP",
    "Partnerships": "VALUE",
    "Common Responses": "FOLLOW_UP",
    "Objection Handling": "FOLLOW_UP",
  };

  // Default to OUTREACH if category doesn't match any mapping
  return categoryMap[categoryString] || "OUTREACH";
}

// Map mock data to Template type
function mapMockToTemplate(mockTemplate: MockTemplateType): Template {
  return {
    id: mockTemplate.id,
    name: mockTemplate.name,
    body: mockTemplate.content || "",
    bodyHtml: mockTemplate.content || "",
    subject: mockTemplate.subject,
    content: mockTemplate.content,
    category: mapCategoryStringToType(mockTemplate.category),
    folderId: mockTemplate.folderId || null,
    usage: mockTemplate.usage || 0,
    openRate: mockTemplate.openRate || "",
    replyRate: mockTemplate.replyRate || "",
    lastUsed: mockTemplate.lastUsed || "",
    isStarred: mockTemplate.isStarred || false,
    type: mockTemplate.type as "template" | "quick-reply",
    companyId: 1, // Default for now
    description: mockTemplate.name,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get templates for the authenticated user
 */
export async function getTemplates(): Promise<ActionResult<Template[]>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view templates",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch with mock data
    // In production, this would fetch from database based on user company
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    // Map mock data to Template type
    const templates: Template[] = initialTemplatesMock.map(mapMockToTemplate);

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("getTemplates error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to retrieve templates",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
  * Get template folders for the authenticated user
  */
export async function getTemplateFolders(): Promise<ActionResult<TemplateFolder[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view template folders",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, return empty array since the page doesn't use folders
    // In a full implementation, this would return the folder structure
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error("getTemplateFolders error:", error);
    return {
      success: false,
      error: "Failed to retrieve template folders",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Get counts for template tabs
 */
export async function getTabCounts(): Promise<ActionResult<Record<string, number>>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view tab counts",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate counts from mock data (in production, this would come from database)
    const templates = initialTemplatesMock;
    const quickReplies = initialTemplatesMock.filter(
      (template) => template.type === "quick-reply"
    );
    const templatesCount = templates.filter(
      (template) => template.type === "template"
    ).length;
    const quickRepliesCount = quickReplies.length;

    const counts = {
      "quick-replies": quickRepliesCount,
      "templates": templatesCount,
      "gallery": 0, // Gallery count is 0 for now
    };

    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error("getTabCounts error:", error);
    return {
      success: false,
      error: "Failed to retrieve tab counts",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}
