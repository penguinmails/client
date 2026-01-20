import Stepper from "@/components/ui/Stepper";
import { AddTemplateContext } from "@features/campaigns/ui/context/add-template-context";

function NewTemplateStepper() {
  return <Stepper context={AddTemplateContext} />;
}

export default NewTemplateStepper;