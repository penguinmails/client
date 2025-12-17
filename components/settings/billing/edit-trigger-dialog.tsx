import { Button } from "@/shared/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import UpdateBillingAddressForm from "./update-billing-address-form";

function EditAddressTrigger({ title }: { title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">{title}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Billing Address</DialogTitle>
        </DialogHeader>
        <UpdateBillingAddressForm />
      </DialogContent>
    </Dialog>
  );
}
export default EditAddressTrigger;
