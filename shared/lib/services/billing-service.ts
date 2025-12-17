import { nile } from "@/shared/config/nile";
import {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  UsageType,
  InvoiceSchema,
} from "@/types/billing";
import { OVERAGE_PRICING } from "@/shared/lib/constants/billing";

// ============================================================================
// HELPERS & MAPPING
// ============================================================================

export const mapRowToInvoice = (row: any): Invoice => ({
  id: row.id,
  companyId: row.company_id,
  invoiceNumber: row.invoice_number,
  amount: row.amount,
  currency: row.currency,
  status: row.status as InvoiceStatus,
  periodStart: new Date(row.period_start),
  periodEnd: new Date(row.period_end),
  paymentMethodId: row.payment_method_id,
  paidAt: row.paid_at ? new Date(row.paid_at) : null,
  paidAmount: row.paid_amount,
  lineItems: typeof row.line_items === 'string' ? JSON.parse(row.line_items) : row.line_items,
  dueDate: new Date(row.due_date),
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  createdById: row.created_by_id,
});

// ============================================================================
// CORE SERVICE LOGIC
// ============================================================================

export async function fetchInvoicesFromDb(companyId: number, limit = 50, offset = 0) {
  const result = await nile.db.query(`
    SELECT * FROM invoices 
    WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    ORDER BY created_at DESC LIMIT $2 OFFSET $3
  `, [companyId, limit, offset]);
  return result.map(mapRowToInvoice);
}

export async function fetchSingleInvoiceFromDb(invoiceId: string | number, companyId: number) {
  const result = await nile.db.query(`
    SELECT * FROM invoices 
    WHERE id = $1 AND company_id = $2 AND tenant_id = CURRENT_TENANT_ID()
  `, [invoiceId, companyId]);
  return result.length > 0 ? mapRowToInvoice(result[0]) : null;
}

export async function generateInvoiceNumber(companyId: number): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const result = await nile.db.query(`
    SELECT COUNT(*) as count FROM invoices 
    WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND EXTRACT(MONTH FROM created_at) = $3
  `, [companyId, year, now.getMonth() + 1]);
  const count = (Number(result[0]?.count) || 0) + 1;
  return `INV-${year}${month}-${companyId}-${String(count).padStart(4, '0')}`;
}

export async function createInvoiceInDb(userId: string, data: any) {
  const totalAmount = data.lineItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
  const invNum = await generateInvoiceNumber(data.companyId);

  const result = await nile.db.query(`
    INSERT INTO invoices (
      company_id, invoice_number, amount, currency, status, 
      period_start, period_end, line_items, due_date, notes, 
      created_by_id, tenant_id, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TENANT_ID(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  `, [
    data.companyId, invNum, totalAmount, 'USD', InvoiceStatus.DRAFT,
    data.periodStart, data.periodEnd, JSON.stringify(data.lineItems),
    data.dueDate, data.notes || null, userId,
  ]);
  return result[0].id;
}

export async function updateInvoiceStatusInDb(invoiceId: string | number, companyId: number, status: InvoiceStatus, paymentData?: any) {
  let query = `UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP`;
  const values: any[] = [status];
  let pIdx = 2;

  if (paymentData && status === InvoiceStatus.PAID) {
    query += `, payment_method_id = $${pIdx++}, paid_amount = $${pIdx++}, paid_at = $${pIdx++}`;
    values.push(paymentData.paymentMethodId, paymentData.paidAmount, paymentData.paidAt.toISOString());
  }

  query += ` WHERE id = $${pIdx++} AND company_id = $${pIdx++} AND tenant_id = CURRENT_TENANT_ID()`;
  values.push(invoiceId.toString(), companyId.toString());

  return await nile.db.query(query, values);
}
