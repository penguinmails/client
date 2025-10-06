import { IPManager } from "@/components/dashboard/ip-manager";

function page() {
  return <IPManager />;
}

export default page;

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
