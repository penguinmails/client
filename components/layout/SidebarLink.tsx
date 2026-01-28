import { cn } from "@/lib/utils";
import { NavLinkItem } from "@/types/nav-link";
import { usePathname, useRouter } from "@/lib/config/i18n/navigation";
import Icon from "@/components/ui/custom/Icon";
import { SidebarMenuButton } from "@/components/ui/sidebar";

function SidebarLink({ link }: { link: NavLinkItem }) {
  const isActive = usePathname() === link.to;
  const router = useRouter();

  function navigate() {
    router.push(link.to);
  }

  return (
    <SidebarMenuButton
      tooltip={link.label}
      onClick={navigate}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer",
        {
          "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 hover:text-white":
            isActive && link.highlight,
          "bg-accent text-accent-foreground border-r-2 border-border shadow-sm hover:bg-accent/80":
            isActive && !link.highlight,
          "text-foreground hover:bg-accent hover:text-accent-foreground":
            !isActive,
        }
      )}
    >
      <Icon
        icon={link.icon}
        className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive
            ? link.highlight
              ? "text-white"
              : "text-accent-foreground"
            : "text-muted-foreground",
        )}
      />
      <span>{link.label}</span>
      {link.highlight && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-300 rounded-full animate-pulse" />
        </div>
      )}
    </SidebarMenuButton>
  );
}

export default SidebarLink;
