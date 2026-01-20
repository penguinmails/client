"use client";

import AlertDialogDelete from "@/components/ui/custom/AlertDialogDelete";
import { developmentLogger } from "@/lib/logger";

function DeleteDomainDialog({ domainId }: { domainId: number }) {
  async function handleDelete() {
    developmentLogger.debug(`Deleting domain with ID: ${domainId}`);
  }

  return (
    <AlertDialogDelete
      title="Delete Domain"
      description="Are you sure you want to delete this domain? This action cannot be undone."
      onDelete={handleDelete}
    />
  );
}
export default DeleteDomainDialog;
