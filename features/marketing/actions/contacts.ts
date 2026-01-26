"use server";

import { makeMauticRequest } from "../lib/mautic-client";
import { 
  ContactDTO, 
  RawMauticContact, 
  NormalizedCollection 
} from "../types/mautic";
import { ActionResult } from "@/types";
import { productionLogger } from "@/lib/logger";

/**
 * Normalizes a raw Mautic contact into a DTO
 */
function normalizeContact(raw: RawMauticContact): ContactDTO {
  const coreFields = raw.fields.core || {};
  return {
    id: Number(raw.id),
    email: (coreFields.email as Record<string, unknown>)?.value as string || '',
    firstName: (coreFields.firstname as Record<string, unknown>)?.value as string || '',
    lastName: (coreFields.lastname as Record<string, unknown>)?.value as string || '',
    company: (coreFields.company as Record<string, unknown>)?.value as string || null,
    points: raw.points,
    tags: Array.isArray(raw.tags) ? raw.tags.map(t => t.tag) : [],
    lastActive: raw.lastActive,
    dateAdded: raw.dateAdded,
    dateModified: raw.dateModified,
  };
}

/**
 * List contacts action
 */
export async function listContactsAction(params: {
  limit?: number;
  start?: number;
  search?: string;
} = {}): Promise<ActionResult<NormalizedCollection<ContactDTO>>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', '/contacts', {
      params: {
        limit: params.limit || 30,
        start: params.start || 0,
        search: params.search || '',
      },
    });

    const contactsMap = (response.contacts as Record<string, unknown>) || {};
    const data: ContactDTO[] = Object.values(contactsMap).map((raw: unknown) => normalizeContact(raw as RawMauticContact));

    return {
      success: true,
      data: {
        data,
        total: Number((response.total as number) || data.length),
      },
    };
  } catch (error: unknown) {
    productionLogger.error("Error listing Mautic contacts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list contacts",
    };
  }
}

/**
 * Get contact by ID action
 */
export async function getContactAction(id: number): Promise<ActionResult<ContactDTO>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', `/contacts/${id}`);
    const contact = normalizeContact(response.contact as RawMauticContact);

    return {
      success: true,
      data: contact,
    };
  } catch (error: unknown) {
    productionLogger.error(`Error fetching Mautic contact ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch contact",
    };
  }
}

/**
 * Upsert contact action (Create or Update by email)
 */
export async function upsertContactAction(
  email: string,
  fields: Partial<Omit<ContactDTO, 'id' | 'email' | 'tags'>> = {}
): Promise<ActionResult<ContactDTO>> {
  try {
    // 1. Search for existing contact
    const searchResult = await listContactsAction({ search: `email:${email}`, limit: 1 });
    
    let response: Record<string, unknown>;
    if (searchResult.success && searchResult.data && searchResult.data.data.length > 0) {
      // 2. Update existing
      const existingId = searchResult.data.data[0].id;
      response = await makeMauticRequest<Record<string, unknown>>('PATCH', `/contacts/${existingId}/edit`, {
        body: JSON.stringify({
          email,
          firstname: fields.firstName,
          lastname: fields.lastName,
          company: fields.company,
        }),
      });
    } else {
      // 3. Create new
      response = await makeMauticRequest<Record<string, unknown>>('POST', '/contacts/new', {
        body: JSON.stringify({
          email,
          firstname: fields.firstName,
          lastname: fields.lastName,
          company: fields.company,
        }),
      });
    }

    return {
      success: true,
      data: normalizeContact(response.contact as RawMauticContact),
    };
  } catch (error: unknown) {
    productionLogger.error(`Error upserting Mautic contact ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upsert contact",
    };
  }
}

/**
 * Delete contact action
 */
export async function deleteContactAction(id: number): Promise<ActionResult<{ id: number }>> {
  try {
    await makeMauticRequest('DELETE', `/contacts/${id}/delete`);
    return {
      success: true,
      data: { id },
    };
  } catch (error: unknown) {
    productionLogger.error(`Error deleting Mautic contact ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete contact",
    };
  }
}
