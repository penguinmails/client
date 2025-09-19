// Modified service using ConvexQueryHelper for rollback testing
import { BaseAnalyticsService } from "./BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import { createConvexHelper, ConvexQueryHelper } from "@/lib/utils/convex-query-helper";

export class CrossDomainAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly convexHelper: ConvexQueryHelper;

  constructor() {
    super("cross-domain");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    this.convexHelper = createConvexHelper(this.convex);
  }

  async getCrossDomainMetrics(filters: any): Promise<any> {
    return this.convexHelper.query("api.crossDomainAnalytics.getCrossDomainMetrics", filters);
  }
}
