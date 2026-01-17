import Link from "next/link";
import { TabsTrigger } from "@/components/ui/tabs";

function TabTrigger({
  id,
  children,
  href,
  className,
}: {
  id: string;
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <TabsTrigger value={id} className={className} asChild>
      <Link href={href}>{children}</Link>
    </TabsTrigger>
  );
}
export default TabTrigger;
