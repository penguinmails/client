import { Button } from "@/shared/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import UpdateCardForm from "./update-card-form";

function UpdateCardDialogTrigger({ title }: { title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment Method</DialogTitle>
        </DialogHeader>
        <UpdateCardForm />
      </DialogContent>
    </Dialog>
  );
}

export default UpdateCardDialogTrigger;
