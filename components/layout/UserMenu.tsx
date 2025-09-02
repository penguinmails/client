"use client"
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

function UserMenu() {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 rounded-full transition-all duration-200 group"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profile?.avatar} alt="User Avatar" />
            <AvatarFallback>
              <AvatarCallback />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
function AvatarCallback() {
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
      <User className="w-4 h-4 text-white" />
    </div>
  );
}
export default UserMenu;
