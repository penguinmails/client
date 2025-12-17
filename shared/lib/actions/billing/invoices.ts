"use server";

import { nile } from "@/shared/config/nile";
import { revalidatePath } from "next/cache";
import * as BillingService from "../../services/billing-service";
import { 
  InvoiceListResponse, 
  InvoiceResponse, 
  InvoiceStatus 
} from "@/types/billing";

export async function getInvoices(companyId?: number, limit = 50, offset = 0): Promise<InvoiceListResponse> {
  try {
    const user = await nile.users.getSelf();
    if (user instanceof Response) return { success: false, error: "Auth required" };
    
    const effectiveId = companyId || (user as any).companyId;
    const data = await BillingService.fetchInvoicesFromDb(effectiveId, limit, offset);
    return { success: true, data };
  } catch (error) {
    console.error("Action Error (getInvoices):", error);
    return { success: false, error: "Failed to retrieve invoices" };
  }
}

export async function getInvoice(invoiceId: string | number): Promise<InvoiceResponse> {
  try {
    const user = await nile.users.getSelf();
    if (user instanceof Response) return { success: false, error: "Auth required" };
    const companyId = (user as any).companyId;

    const data = await BillingService.fetchSingleInvoiceFromDb(invoiceId, companyId);
    if (!data) return { success: false, error: "Invoice not found" };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to retrieve invoice" };
  }
}

export async function createInvoice(invoiceData: any): Promise<InvoiceResponse> {
  try {
    const user = await nile.users.getSelf();
    if (user instanceof Response) return { success: false, error: "Auth required" };

    const id = await BillingService.createInvoiceInDb(user.id, invoiceData);
    const invoice = await BillingService.fetchSingleInvoiceFromDb(id, invoiceData.companyId);

    revalidatePath("/dashboard/billing");
    return { success: true, data: invoice! };
  } catch (error) {
    return { success: false, error: "Creation failed" };
  }
}

export async function updateInvoiceStatus(invoiceId: string | number, status: InvoiceStatus, paymentData?: any): Promise<InvoiceResponse> {
  try {
    const user = await nile.users.getSelf();
    if (user instanceof Response) return { success: false, error: "Auth required" };
    const companyId = (user as any).companyId;

    await BillingService.updateInvoiceStatusInDb(invoiceId, companyId, status, paymentData);
    const updated = await BillingService.fetchSingleInvoiceFromDb(invoiceId, companyId);

    revalidatePath("/dashboard/billing");
    return { success: true, data: updated! };
  } catch (error) {
    return { success: false, error: "Update failed" };
  }
}

export async function getBillingHistory(companyId?: number, limit = 20): Promise<InvoiceListResponse> {
  return getInvoices(companyId, limit, 0);
}
