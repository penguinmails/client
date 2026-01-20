import Stepper from "@/components/ui/Stepper";
import { AddDomainContext } from "@features/domains/ui/context/add-domain-context";

function NewDomainStepper() {
  return <Stepper context={AddDomainContext} />;
}
export default NewDomainStepper;
