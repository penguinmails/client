import { NextResponse } from 'next/server';
import { listContactsAction } from '@/features/marketing/actions/contacts';
import { 
  getCached, 
  setCache, 
  CacheTTL, 
  buildLeadsCacheKey 
} from '@/lib/cache/cache-service';
import { productionLogger } from '@/lib/logger';

export interface LeadApiResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'active' | 'inactive' | 'prospect';
    tags: string[];
    points?: number;
    lastActive?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

// Extended contact interface with optional phone property from Mautic
interface MauticContact extends Record<string, unknown> {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  points?: number;
  lastActive?: string;
  dateAdded?: string;
  dateModified?: string;
}

/**
 * GET /api/leads
 * 
 * Fetches leads from Mautic with Redis caching.
 * Query Parameters:
 *   - listId: Filter by segment ID
 *   - listAlias: Filter by segment alias
 * 
 * Cache Headers:
 *   - Cache-Control: public, max-age=60, stale-while-revalidate=300
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId') || undefined;
    const listAlias = searchParams.get('listAlias') || undefined;

    // Build cache key and check cache
    const cacheKey = buildLeadsCacheKey({ listId, listAlias });
    const cached = await getCached<LeadApiResponse>(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from Mautic
    const segmentFilter = listAlias || listId || '';
    const search = segmentFilter ? `segment:${segmentFilter}` : '';
    const contactsResult = await listContactsAction({ limit: 100, search });

    if (!contactsResult.success) {
      const errorResponse: LeadApiResponse = {
        success: false,
        error: contactsResult.error || 'Failed to fetch leads',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Map to API response format
    const leads = contactsResult.data.data.map(contact => ({
      id: String(contact.id),
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
      email: contact.email,
      phone: (contact as MauticContact).phone || undefined,
      company: contact.company || undefined,
      status: 'active' as const,
      tags: contact.tags || [],
      points: contact.points || 0,
      lastActive: contact.lastActive || null,
      createdAt: contact.dateAdded,
      updatedAt: contact.dateModified,
    }));

    const response: LeadApiResponse = {
      success: true,
      data: leads,
    };

    // Cache the result
    await setCache(cacheKey, response, CacheTTL.LEADS);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    productionLogger.error('[API /leads] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
