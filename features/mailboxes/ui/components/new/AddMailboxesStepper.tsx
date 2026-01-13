import Stepper from "@/components/ui/Stepper";
import { AddMailboxesContext } from "@features/inbox/ui/context/add-mailboxes-context";

function NewMailboxesStepper() {
  return <Stepper context={AddMailboxesContext} />;
}
export default NewMailboxesStepper;
