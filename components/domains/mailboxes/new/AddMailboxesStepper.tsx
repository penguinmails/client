import Stepper from "@/shared/ui/Stepper";
import { AddMailboxesContext } from "@/context/AddMailboxesContext";

function NewMailboxesStepper() {
  return <Stepper context={AddMailboxesContext} />;
}
export default NewMailboxesStepper;
