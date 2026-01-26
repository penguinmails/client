"use server";

import { createSegmentAction, addContactToSegmentAction } from "@/features/marketing/actions/segments";
import { upsertContactAction } from "@/features/marketing/actions/contacts";
import { ActionResult } from "@/types";
import { CSVRecord } from "@/types/clients-leads";
import { productionLogger } from "@/lib/logger";

interface ImportResult {
  success: number;
  paramsErrors: number;
  failed: number;
  segmentId?: number | string;
  errors?: string[];
}

export async function importCSVContactsAction(params: {
  listName: string;
  tags: string;
  contacts: CSVRecord[];
  columnMapping: Record<string, string>;
}): Promise<ActionResult<ImportResult>> {
  try {
    const { listName, tags, contacts, columnMapping } = params;
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const errors: string[] = [];

    // 1. Create Segment
    const segmentResult = await createSegmentAction({
      name: listName,
      description: `Imported on ${new Date().toLocaleDateString()}`,
    });

    if (!segmentResult.success) {
      return {
        success: false,
        error: segmentResult.error || "Failed to create segment",
      };
    }

    const segmentId = segmentResult.data.id;
    let successCount = 0;
    let failCount = 0;

    // 2. Process Contacts (Sequential to avoid rate limits, or batch if API supported)
    // For now, sequential/parallel with limit is safer. Mautic API might be slow.
    // We'll do chunks of 5 for safety.
    const CHUNK_SIZE = 5;
    
    for (let i = 0; i < contacts.length; i += CHUNK_SIZE) {
      const chunk = contacts.slice(i, i + CHUNK_SIZE);
      
      await Promise.all(chunk.map(async (row) => {
        try {
          // Map CSV Data to Mautic Fields
          const email = row[columnMapping['email']];
          if (!email) {
             // Skip invalid rows without email
             return;
          }

          const contactFields: Record<string, any> = {
            firstName: row[columnMapping['firstName']] || '',
            lastName: row[columnMapping['lastName']] || '',
            company: row[columnMapping['company']] || '',
            // Add other standard fields mapping here if needed
          };
          
          Object.keys(columnMapping).forEach(key => {
             // Handle custom columns if mapped
             if (key.startsWith('custom_') && columnMapping[key]) {
               // Note: Mautic needs custom fields to exist. For now we might skip or support if aligned
               // contactFields[key] = row[columnMapping[key]];
             }
          });

          // Create/Update Contact
          const contactResult = await upsertContactAction(email, contactFields);

          if (contactResult.success && contactResult.data) {
             const contactId = contactResult.data.id;
             
             // Add to Segment
             await addContactToSegmentAction(segmentId, contactId);
             
             successCount++;
          } else {
             failCount++;
             if (!contactResult.success && contactResult.error) {
                 errors.push(`Failed to import ${email}: ${contactResult.error}`);
             }
          }
        } catch (err) {
          failCount++;
          errors.push(`Row processing error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }));
    }

    return {
      success: true,
      data: {
        success: successCount,
        failed: failCount,
        paramsErrors: 0,
        segmentId,
        errors: errors.slice(0, 10) // Return first 10 errors
      }
    };

  } catch (error) {
    productionLogger.error("Import CSV Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import failed",
    };
  }
}
