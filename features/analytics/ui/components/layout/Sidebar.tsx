"use client";
import { Logo } from "@/components/ui/custom/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "@/types/nav-link";
import {
  BarChart3,
  BookOpen,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  Send,
  Server,
  Users,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import { useEnrichment } from "@features/auth/hooks/use-enrichment";


// Navigation groups that are always visible (public)
const publicNavigationGroups: NavLink[] = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Getting Started",
    items: [
      {
        to: "/dashboard/onboarding",
        label: "Setup Guide",
        icon: BookOpen,
        highlight: true,
      },
    ],
  },
];

// Navigation groups that require enriched user data (role-dependent)
const enrichedNavigationGroups: NavLink[] = [
  {
    title: "Outreach Hub",
    items: [
      { to: "/dashboard/campaigns", label: "Campaigns", icon: Send },
      { to: "/dashboard/templates", label: "Templates", icon: FileText },
    ],
  },
  {
    title: "Lead Hub",
    items: [{ to: "/dashboard/leads", label: "Lead Lists", icon: Users }],
  },
  {
    title: "Communication",
    items: [{ to: "/dashboard/inbox", label: "Inbox", icon: Inbox }],
  },
  {
    title: "Infrastructure",
    items: [
      { to: "/dashboard/domains", label: "Domains & Mailboxes", icon: Server },
    ],
  },
  {
    title: "Analytics",
    items: [
      { to: "/dashboard/analytics", label: "Analytics Hub", icon: BarChart3 },
    ],
  },
];

// Skeleton for nav items
function NavItemSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton className="animate-pulse">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}

function NavGroupSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SidebarGroup key={index}>
          <SidebarGroupLabel className="animate-pulse">
            <div className="h-3 w-16 bg-muted rounded" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItemSkeleton count={2} />
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function AppSideBar() {
  const { isLoadingEnrichment, enrichedUser } = useEnrichment();
  
  // Show skeletons if:
  // 1. Enrichment is actively loading, OR
  // 2. We have a user but no role yet (enrichment not complete)
  const hasEnrichedData = !!enrichedUser?.role;
  const showSkeletons = isLoadingEnrichment || (enrichedUser && !hasEnrichedData);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <>
        <SidebarHeader className=" flex items-center justify-between ">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="flex items-center gap-1" size="lg">
                <Logo />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <SidebarMenu>
            {/* Always show public navigation groups */}
            {publicNavigationGroups.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="select-none">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarLink link={item} />
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
            
            {/* Show skeletons or actual enriched navigation groups */}
            {showSkeletons ? (
              <NavGroupSkeleton count={5} />
            ) : (
              enrichedNavigationGroups.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel className="select-none">
                    {group.title}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarLink link={item} />
                      </SidebarMenuItem>
                    ))}
                  </SidebarGroupContent>
                </SidebarGroup>
              ))
            )}
          </SidebarMenu>
        </SidebarContent>
      </>
    </Sidebar>
  );
}
export default AppSideBar;

