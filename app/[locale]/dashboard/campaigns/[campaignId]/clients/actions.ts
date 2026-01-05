"use server";

import { campaignLeads } from "@/shared/mocks/providers";
import { developmentLogger } from "@/lib/logger";

export async function getClientsPage(
  campaignId: string,
  page: number,
  limit: number = 10,
) {
  developmentLogger.debug("Getting clients page", { campaignId, page });

  const clients = campaignLeads;
  const total = clients.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedClients = clients.slice(start, end);

  return {
    clients: paginatedClients,
    total,
    pages,
  };
}
