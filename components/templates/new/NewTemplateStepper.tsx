import Stepper from "@/shared/ui/Stepper";
import { AddTemplateContext } from "@/context/AddTemplateContext";

function NewTemplateStepper() {
  return <Stepper context={AddTemplateContext} />;
}

export default NewTemplateStepper;
