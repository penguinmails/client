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
    Activity,
    Users,
} from "lucide-react";
import SidebarLink from "@/features/analytics/ui/components/layout/SidebarLink";
import { useTranslations } from "next-intl";

function AdminSidebar() {
    const t = useTranslations("AdminSidebar");

    const adminNavigationGroups: NavLink[] = [
        {
            title: t("sections.system"),
            items: [
                {
                    to: "/admin",
                    label: t("items.diagnostics"),
                    icon: Activity,
                },
                {
                    to: "/admin/users",
                    label: t("items.users"),
                    icon: Users,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <>
                <SidebarHeader className="flex items-center justify-between">
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
                        {adminNavigationGroups.map((group) => (
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
                    </SidebarMenu>
                </SidebarContent>
            </>
        </Sidebar>
    );
}

export default AdminSidebar;
