import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Crown, Loader2 } from "lucide-react";

const defaultPlans = [
  { id: 'starter', name: "Starter", price: 35, contacts: 3000, storage: 1 },
  { id: 'growth', name: "Growth", price: 55, contacts: 10000, storage: 2 },
  { id: 'scale', name: "Scale", price: 89, contacts: 50000, storage: 4 },
  { id: 'pro', name: "Pro", price: 189, contacts: "Unlimited", storage: 7 },
];

type Plan = { id: string; name: string; price: number | string; contacts: number | string; storage: number };

function ChangePlanTrigger({ title, plans = defaultPlans, onSelectPlan, isLoading }: { title: string; plans?: Plan[]; onSelectPlan: (plan: Plan) => Promise<void>; isLoading?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={isLoading}>{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl  max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <p className="text-muted-foreground">
            Select the perfect plan for your email marketing needs
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-sm">
                  {plan.storage} GB Storage
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Contacts
                    </span>
                    <span className="font-semibold text-foreground">
                      {typeof plan.contacts === "number"
                        ? plan.contacts.toLocaleString()
                        : plan.contacts}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Storage
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.storage} GB
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoading}>
                      Change Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                          <Crown className="text-green-500" />
                        </div>
                      </div>
                      <AlertDialogTitle className="text-center">
                        Confirm Plan Upgrade
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        You&apos;re about to switch to {plan.name}. You will be charged the
                        prorated difference immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button disabled={isLoading} onClick={async () => { await onSelectPlan(plan); }}>
                          {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" />Processing...</> : 'Confirm Upgrade'}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function ConfirmDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Change Plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Crown className="text-green-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            Confirm Plan Upgrade
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You&apos;re about to switch from Growth to Pro. You will be charged the
            prorated difference immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Confirm Upgrade</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ChangePlanTrigger };
