"use server";

import { makeMauticRequest } from "../lib/mautic-client";
import { 
  ContactDTO, 
  RawMauticContact, 
  MauticApiResponse,
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
    email: coreFields.email?.value || '',
    firstName: coreFields.firstname?.value || '',
    lastName: coreFields.lastname?.value || '',
    company: coreFields.company?.value || null,
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
    const response = await makeMauticRequest<any>('GET', '/contacts', {
      params: {
        limit: params.limit || 30,
        start: params.start || 0,
        search: params.search || '',
      },
    });

    const contactsMap = response.contacts || {};
    const data: ContactDTO[] = Object.values(contactsMap).map((raw: any) => normalizeContact(raw));

    return {
      success: true,
      data: {
        data,
        total: Number(response.total || data.length),
      },
    };
  } catch (error: any) {
    productionLogger.error("Error listing Mautic contacts:", error);
    return {
      success: false,
      error: error.message || "Failed to list contacts",
    };
  }
}

/**
 * Get contact by ID action
 */
export async function getContactAction(id: number): Promise<ActionResult<ContactDTO>> {
  try {
    const response = await makeMauticRequest<any>('GET', `/contacts/${id}`);
    const contact = normalizeContact(response.contact);

    return {
      success: true,
      data: contact,
    };
  } catch (error: any) {
    productionLogger.error(`Error fetching Mautic contact ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to fetch contact",
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
    
    let response: any;
    if (searchResult.success && searchResult.data && searchResult.data.data.length > 0) {
      // 2. Update existing
      const existingId = searchResult.data.data[0].id;
      response = await makeMauticRequest<any>('PATCH', `/contacts/${existingId}/edit`, {
        body: JSON.stringify({
          email,
          firstname: fields.firstName,
          lastname: fields.lastName,
          company: fields.company,
        }),
      });
    } else {
      // 3. Create new
      response = await makeMauticRequest<any>('POST', '/contacts/new', {
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
      data: normalizeContact(response.contact),
    };
  } catch (error: any) {
    productionLogger.error(`Error upserting Mautic contact ${email}:`, error);
    return {
      success: false,
      error: error.message || "Failed to upsert contact",
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
  } catch (error: any) {
    productionLogger.error(`Error deleting Mautic contact ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to delete contact",
    };
  }
}
