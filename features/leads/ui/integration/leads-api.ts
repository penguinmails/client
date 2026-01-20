/**
 * Leads Feature - Integration Layer (BFF)
 * 
 * Client-side API calls with caching and response handling.
 * Uses server actions under the hood.
 */

import {
  getLeadLists,
  getLeadListById,
  createLeadList,
  updateLeadList,
  deleteLeadList,
  getLeadsByListId,
} from '../../actions';
import type { LeadList, LeadListFilters, LeadListFormData } from '../../types';

// ============================================================
// Lead Lists API
// ============================================================

export const leadsApi = {
  /**
   * Fetch all lead lists with optional filters
   */
  async fetchLists(_filters?: LeadListFilters): Promise<LeadList[]> {
    const result = await getLeadLists();
    if (!result.success) {
      throw new Error('Failed to fetch lead lists');
    }
    // TODO: Apply filters on client if not supported by backend
    return result.data;
  },

  /**
   * Fetch a single lead list by ID
   */
  async fetchListById(id: string): Promise<LeadList | null> {
    const result = await getLeadListById(id);
    if (!result.success) {
      throw new Error('Failed to fetch lead list');
    }
    return result.data;
  },

  /**
   * Create a new lead list
   */
  async createList(data: LeadListFormData): Promise<LeadList> {
    const result = await createLeadList(data);
    if (!result.success) {
      throw new Error('Failed to create lead list');
    }
    return result.data;
  },

  /**
   * Update an existing lead list
   */
  async updateList(id: string, data: Partial<LeadListFormData>): Promise<void> {
    const result = await updateLeadList(id, data);
    if (!result.success) {
      throw new Error('Failed to update lead list');
    }
  },

  /**
   * Delete a lead list
   */
  async deleteList(id: string): Promise<void> {
    const result = await deleteLeadList(id);
    if (!result.success) {
      throw new Error('Failed to delete lead list');
    }
  },

  /**
   * Fetch leads by list ID
   */
  async fetchLeadsByList(listId: string) {
    const result = await getLeadsByListId(listId);
    if (!result.success) {
      throw new Error('Failed to fetch leads');
    }
    return result.data;
  },
};
