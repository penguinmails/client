import { IpManagerPage } from "@features/ip-manager";

export default function IpManagerRoute() {
  return <IpManagerPage />;
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
