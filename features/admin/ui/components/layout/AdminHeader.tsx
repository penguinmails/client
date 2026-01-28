"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpCircle, LogOut } from "lucide-react";
import { NotificationsPopover } from "@/components/notifications-popover";
import { Button } from "@/components/ui/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/auth/use-auth";
import { useTranslations } from "next-intl";
import { productionLogger } from "@/lib/logger";

function AvatarCallback() {
    return (
        <div className="size-8 bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <User className="size-4 text-white" />
        </div>
    );
}

function AdminHeader() {
    const t = useTranslations("Components.DashboardHeader");
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            productionLogger.info("Admin logout initiated");
            await logout();
            productionLogger.info("Admin logout successful, reloading page");

            // Set flag to force fresh session check on reload
            sessionStorage.setItem('justLoggedOut', 'true');

            // Force a full page reload to clear React state cache
            // and trigger fresh session recovery with force refresh
            window.location.reload();
        } catch (error) {
            productionLogger.error("Error signing out:", error);
            // Still reload even on error to ensure clean state
            sessionStorage.setItem('justLoggedOut', 'true');
            window.location.reload();
        }
    };

    return (
        <header className="flex items-center justify-between p-4.5">
            <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
            </div>
            <div className="flex h-5 items-center space-x-1">
                <div className="flex items-center space-x-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center p-1 rounded-md hover:bg-accent">
                                <HelpCircle className="w-5 h-5 font-bold group-hover:scale-110 transition-transform" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <a href="https://help.penguinmails.com/" target="_blank" rel="noopener noreferrer">{t("knowledgeBase")}</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="https://penguinmails.com/contact-us/" target="_blank" rel="noopener noreferrer">{t("support")}</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="https://help.penguinmails.com/video-tutorials" target="_blank" rel="noopener noreferrer">{t("videoTutorials")}</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        <NotificationsPopover />
                    </DropdownMenu>
                </div>
                <Separator orientation="vertical" className="mx-2 -ml-1.5" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="p-0 rounded-full transition-all duration-200 group"
                        >
                            <Avatar className="size-8">
                                <AvatarImage src={user?.photoURL} alt="User Avatar" />
                                <AvatarFallback>
                                    <AvatarCallback />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem asChild>
                            <button
                                onClick={handleLogout}
                                className="size-full bg-red-500 dark:bg-red-600 text-white rounded-md flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200 flex gap-2 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default AdminHeader;
