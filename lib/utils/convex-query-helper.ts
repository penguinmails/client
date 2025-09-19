// Mock ConvexQueryHelper for rollback testing
export class ConvexQueryHelper {
    constructor(private convex: any) {}
    async query<T>(queryFn: any, args: any): Promise<T> {
        return {} as T;
    }
}
export function createConvexHelper(convex: any) {
    return new ConvexQueryHelper(convex);
}
