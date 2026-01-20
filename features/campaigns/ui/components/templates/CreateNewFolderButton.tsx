import { Folder, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewFolderForm from "./NewFolderForm";

function CreateNewFolderButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FolderPlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-6">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Folder className="size-4 text-primary" />
            </div>
            <DialogTitle>Create New Folder</DialogTitle>
          </div>
        </DialogHeader>
        <NewFolderForm />
      </DialogContent>
    </Dialog>
  );
}
export default CreateNewFolderButton;