"use client";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/lib/config/i18n/navigation";

function IconLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const currentPage = usePathname();
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "p-2.5 rounded-lg transition-all duration-200 group ",
          currentPage === href
            ? "text-accent-foreground bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        {children}
      </Button>
    </Link>
  );
}
export default IconLink;
