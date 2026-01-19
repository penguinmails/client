import React, { useTransition } from "react";
import { cn } from "@/lib/utils";
import { NavLinkItem } from "@/types/nav-link";
import { usePathname } from "next/navigation";
import { useRouter } from "@/lib/config/i18n/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon, Loader2 } from "lucide-react";

/**
 * SidebarLink - Navigation link with React 19 transition support.
 * 
 * Uses useTransition to wrap navigation in startTransition, which:
 * - Marks the navigation as non-urgent, keeping current UI responsive
 * - Provides isPending state for visual feedback (spinner icon)
 * - Works with Suspense boundaries for smooth skeleton loading
 */
function SidebarLink({ link }: { link: NavLinkItem }) {
  const pathname = usePathname();
  
  // Check if this is the infrastructure (Domains & Mailboxes) link
  // and if we're on any infrastructure route (domains, mailboxes, warmup)
  const isInfrastructureLink = link.to === "/dashboard/domains";
  const isOnInfrastructureRoute = 
    pathname.includes("/dashboard/domains") || 
    pathname.includes("/dashboard/mailboxes") || 
    pathname.includes("/dashboard/warmup");
  
  // For Dashboard link, check exact match (pathname ends with /dashboard)
  // For other links, check if pathname includes the link path
  // For infrastructure link, also check if we're on any infrastructure route
  const isDashboardLink = link.to === "/dashboard";
  const isExactDashboardMatch = isDashboardLink && pathname.endsWith("/dashboard");
  
  const isActive = 
    isExactDashboardMatch || 
    (!isDashboardLink && pathname.includes(link.to)) || 
    (isInfrastructureLink && isOnInfrastructureRoute);
    
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate() {
    // Skip navigation if already on target route
    if (isActive) return;
    
    // Wrap navigation in startTransition for smooth UX
    startTransition(() => {
      router.push(link.to);
    });
  }

  return (
    <SidebarMenuButton
      tooltip={link.label}
      onClick={navigate}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer",
        // Pending state: show subtle loading indicator
        isPending && "opacity-70",
        {
          "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 hover:text-white":
            isActive && link.highlight,
          "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/50":
            isActive && !link.highlight,
          "text-foreground hover:bg-accent hover:text-accent-foreground":
            !isActive && !isPending,
        }
      )}
    >
      {/* Show spinner during navigation, otherwise show icon */}
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground flex-shrink-0" />
      ) : (
        link.icon &&
        React.createElement(link.icon as LucideIcon, {
          className: cn(
            "w-5 h-5 flex-shrink-0",
            isActive
              ? link.highlight
                ? "text-white"
                : "text-blue-600 dark:text-blue-400"
              : "text-muted-foreground"
          ),
        })
      )}
      <span>{link.label}</span>
      {link.highlight && !isPending && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-300 rounded-full animate-pulse" />
        </div>
      )}
    </SidebarMenuButton>
  );
}

export default SidebarLink;
