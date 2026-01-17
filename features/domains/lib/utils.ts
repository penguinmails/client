// import { DomainStatus } from "@features/domains/types";

/**
 * Returns CSS classes for status styling based on warmup status
 * @param status - The warmup status
 * @returns CSS class string for styling
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "WARMED":
    case "VERIFIED":
    case "ACTIVE":
      return "bg-green-100 text-green-800 border-green-200";
    case "WARMING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PENDING":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "PAUSED":
    case "SUSPENDED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "NOT_STARTED":
    case "SETUP_REQUIRED":
      return "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-200 dark:border-border";
    case "FAILED":
    case "ISSUE":
    case "DELETED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-200 dark:border-border";
  }
}

/**
 * Returns a human-readable status label
 * @param status - The status value
 * @returns Human-readable status string
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "WARMED":
      return "Ready";
    case "WARMING":
      return "Warming Up";
    case "PAUSED":
      return "Paused";
    case "NOT_STARTED":
      return "Not Started";
    case "VERIFIED":
      return "Verified";
    case "PENDING":
      return "Pending";
    case "ACTIVE":
      return "Active";
    case "SUSPENDED":
      return "Suspended";
    case "SETUP_REQUIRED":
      return "Setup Required";
    case "FAILED":
      return "Failed";
    case "ISSUE":
      return "Issue";
    case "DELETED":
      return "Deleted";
    default:
      return status;
  }
}

/**
 * Validates if a domain name is properly formatted
 * @param domain - The domain name to validate
 * @returns Boolean indicating if domain is valid
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
}

/**
 * Extracts the root domain from a subdomain
 * @param domain - The domain name (can include subdomains)
 * @returns The root domain
 */
export function getRootDomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length <= 2) {
    return domain;
  }
  return parts.slice(-2).join('.');
}

/**
 * Calculates warmup progress percentage based on days active and target
 * @param daysActive - Number of days the mailbox has been active
 * @param targetDays - Target number of days for complete warmup (default: 30)
 * @returns Progress percentage (0-100)
 */
export function calculateWarmupProgress(daysActive: number, targetDays: number = 30): number {
  return Math.min(Math.round((daysActive / targetDays) * 100), 100);
}

/**
 * Determines if a domain is ready for production sending
 * @param domain - The domain object
 * @returns Boolean indicating if domain is production ready
 */
export function isDomainProductionReady(domain: { 
  status: string; 
  spf?: boolean; 
  dkim?: boolean; 
  dmarc?: boolean; 
}): boolean {
  return (
    domain.status === "VERIFIED" &&
    domain.spf === true &&
    domain.dkim === true &&
    domain.dmarc === true
  );
}
