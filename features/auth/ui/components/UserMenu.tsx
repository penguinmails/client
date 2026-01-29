"use client";
import { Button } from "@/components/ui/button/button";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth/use-auth";
import { SignOutButton } from "@niledatabase/react";
import { useTranslations } from "next-intl";

function UserMenu() {
  const { user } = useAuth();
  const t = useTranslations("Auth");

  return (
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
        <SignOutButton 
          className="size-full bg-red-500 dark:bg-red-600 text-white rounded-md flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
          buttonText={t("logout")}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function AvatarCallback() {
  return (
    <div className="size-8 bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
      <User className="size-4 text-white" />
    </div>
  );
}
export default UserMenu;
