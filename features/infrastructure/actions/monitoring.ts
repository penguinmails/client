"use server";

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { getHestiaConfig } from "./config";
import { listSysServices, HestiaServiceStatus } from "../api/hestia";

/**
 * Service status data for the dashboard
 */
export interface ServiceStatusData {
  name: string;
  state: 'running' | 'stopped';
  cpu?: string;
  memory?: string;
}

/**
 * Maps Hestia service status to frontend format
 */
function mapHestiaServices(services: HestiaServiceStatus): ServiceStatusData[] {
  return Object.entries(services).map(([serviceName, data]) => ({
    name: serviceName,
    state: data.STATE,
    cpu: data.CPU,
    memory: data.MEM,
  }));
}

/**
 * Gets system services status from Hestia
 */
export async function getSystemServicesAction(): Promise<ActionResult<ServiceStatusData[]>> {
  try {
    const config = getHestiaConfig();
    const services = await listSysServices(config);
    const mapped = mapHestiaServices(services);

    return {
      success: true,
      data: mapped
    };
  } catch (error) {
    productionLogger.error("Error fetching system services from Hestia:", error);
    return {
      success: false,
      error: "Failed to fetch system services"
    };
  }
}
