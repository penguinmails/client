// Mock runtime performance monitor for rollback testing
export class RuntimePerformanceMonitor {
    recordMetric(metric: any) {}
}
export function getGlobalRuntimeMonitor() {
    return new RuntimePerformanceMonitor();
}
