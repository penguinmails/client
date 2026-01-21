import { Suspense } from "react";
import NewDomainPageContent from "./NewDomainPageContent";

export const dynamic = "force-dynamic";

export default function NewDomainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDomainPageContent />
    </Suspense>
  );
}
