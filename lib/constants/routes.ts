/**
 * Infrastructure routes that belong to the "Domains & Mailboxes" section.
 * Used to highlight the sidebar item when navigating to any of these routes.
 */
export const INFRASTRUCTURE_ROUTES = [
  "/dashboard/domains",
  "/dashboard/mailboxes", 
  "/dashboard/warmup"
] as const;

/**
 * The main infrastructure route used for the sidebar link.
 */
export const INFRASTRUCTURE_MAIN_ROUTE = "/dashboard/domains";

/**
 * The main dashboard route.
 */
export const DASHBOARD_ROUTE = "/dashboard";

/**
 * Helper to check if current path matches any infrastructure route.
 * Handles locale prefixes (e.g., /en/dashboard/mailboxes) by checking
 * if the pathname ends with the route or contains it followed by a slash.
 * This prevents false matches on unrelated paths.
 */
export function isInfrastructureRoute(pathname: string): boolean {
  return INFRASTRUCTURE_ROUTES.some(route => matchesRoute(pathname, route));
}

/**
 * Helper to check if a pathname matches a route.
 * Handles locale prefixes (e.g., /en/dashboard/campaigns) by checking:
 * - If pathname ends with the route (exact match)
 * - If pathname contains the route followed by a slash (subroute)
 * This prevents false matches like "/some/other/dashboard/campaigns" matching "/dashboard/campaigns".
 */
export function matchesRoute(pathname: string, route: string): boolean {
  return pathname.endsWith(route) || pathname.includes(route + "/");
}
