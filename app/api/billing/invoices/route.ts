import { NextRequest, NextResponse } from "next/server";
import { nile } from "@/shared/config/nile";
// ✅ Import only from the Service (SAFE)
import { 
  fetchInvoicesFromDb, 
  createInvoiceInDb
} from "@/shared/lib/services/billing-service";

// GET /api/billing/invoices - Get company invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 1. Authentication Check (Manual check since we aren't using the Action)
    const user = await nile.users.getSelf();
    if (user instanceof Response || !user) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const companyId = (user as any).companyId;

    // 2. Call Service directly
    const data = await fetchInvoicesFromDb(
      companyId,
      Math.min(limit, 100), 
      Math.max(offset, 0)
    );

    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        limit,
        offset,
        total: data.length, // Still using length per your original bug note
      },
    });
  } catch (error) {
    console.error("GET /api/billing/invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/billing/invoices - Generate new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodStart, periodEnd, invoiceType = "usage" } = body as {
      periodStart: string;
      periodEnd: string;
      invoiceType?: string;
    };
    
    // Basic Validation
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Period start and end dates are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    
    // User Context
    const user = await nile.users.getSelf();
    if (user instanceof Response || !user) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const companyId = (user as any).companyId;

    if (invoiceType === "usage") {
      /**
       * Note: If generateUsageInvoice has complex calculation logic, 
       * that logic should also be moved to billing-service.ts.
       * For now, we use createInvoiceInDb as the base operation.
       */
      const invoiceData = {
        companyId,
        periodStart: startDate,
        periodEnd: endDate,
        lineItems: [], // You would calculate these in a Service
        dueDate: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      };

      const id = await createInvoiceInDb(user.id, invoiceData);
      
      return NextResponse.json({
        success: true,
        data: { id },
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Unsupported invoice type", code: "UNSUPPORTED_INVOICE_TYPE" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/billing/invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
