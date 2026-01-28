import { NextResponse } from 'next/server';
import { listSegmentsAction } from '@/features/marketing/actions/segments';
import { listContactsAction } from '@/features/marketing/actions/contacts';
import { 
  getCached, 
  setCache, 
  buildSegmentsCacheKey 
} from '@/lib/cache/cache-service';
import { productionLogger } from '@/lib/logger';

export interface SegmentApiResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    alias?: string;
    description?: string;
    contacts: number;
    isPublished: boolean;
    dateAdded?: string;
    dateModified?: string;
  }>;
  error?: string;
}

/**
 * GET /api/segments
 * 
 * Fetches segments from Mautic with Redis caching.
 * Also performs server-side batch count synchronization to ensure accuracy.
 */
export async function GET() {
  try {
    // 1. Check primary segments list cache
    const listCacheKey = buildSegmentsCacheKey();
    const cachedList = await getCached<SegmentApiResponse>(listCacheKey);
    
    if (cachedList) {
      return NextResponse.json(cachedList, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    // 2. Fetch base segments list from Mautic
    const segmentsResult = await listSegmentsAction({ limit: 100 });

    if (!segmentsResult.success) {
      return NextResponse.json({
        success: false,
        error: segmentsResult.error || 'Failed to fetch segments',
      }, { status: 500 });
    }

    const baseSegments = segmentsResult.data.data;

    // 3. Sync counts in parallel (Batch optimization)
    // We fetch "live" counts for each segment to avoid Mautic list count lag
    const enrichedSegments = await Promise.all(
      baseSegments.map(async (segment) => {
        const countCacheKey = `pm:leads:list:count:${segment.alias || segment.id}`;
        
        try {
          // Check if we have a fresh live count in cache (1-minute TTL for counts)
          const cachedCount = await getCached<number>(countCacheKey);
          if (cachedCount !== null) {
            return {
              ...segment,
              liveCount: cachedCount
            };
          }

          // Fetch "live" count from Mautic by querying contacts
          const countResult = await listContactsAction({ 
            limit: 1, 
            search: `segment:${segment.alias || segment.id}` 
          });

          const liveCount = countResult.success ? countResult.data.total : segment.contactCount;
          
          // Cache live count individually for 1 minute
          await setCache(countCacheKey, liveCount, 60);

          return {
            ...segment,
            liveCount
          };
        } catch (error) {
          productionLogger.warn(`Failed to sync count for segment ${segment.alias || segment.id}:`, error);
          return { ...segment, liveCount: segment.contactCount };
        }
      })
    );

    // 4. Map to API response format
    const segments = enrichedSegments.map(segment => ({
      id: String(segment.id),
      name: segment.name,
      alias: segment.alias,
      description: segment.description || undefined,
      contacts: segment.liveCount ?? segment.contactCount,
      isPublished: segment.isPublished,
      dateAdded: segment.dateAdded,
      dateModified: segment.dateModified,
    }));

    const response: SegmentApiResponse = {
      success: true,
      data: segments,
    };

    // 5. Cache the aggregate list for 1 minute (short TTL for aggregate, longer via indywidual keys)
    await setCache(listCacheKey, response, 60);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    productionLogger.error('[API /segments] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
