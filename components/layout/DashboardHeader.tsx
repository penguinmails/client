import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpCircle, Settings } from "lucide-react";
import LinkIcon from "./IconLink";
import { NotificationsPopover } from "@/components/notifications-popover";
import { UserMenu } from "@/components/user-menu";

import { useTranslations } from "next-intl";

function Header() {
  const t = useTranslations("Components.DashboardHeader");

  return (
    <header className="flex items-center justify-between p-4.5 bg-background rounded-xl border shadow-sm">
      <div className="flex items-center ">
        <SidebarTrigger className="mr-4" />
      </div>
      <div className="flex h-5 items-center space-x-1">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
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
            <LinkIcon href="/dashboard/settings">
              <Settings className="w-5 h-5 font-bold group-hover:scale-110 transition-transform" />
            </LinkIcon>
          </DropdownMenu>
        </div>
        <Separator orientation="vertical" className="mx-3" />
        <UserMenu />
      </div>
    </header>
  );
}
export default Header;
