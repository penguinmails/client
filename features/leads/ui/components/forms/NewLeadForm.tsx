"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea";
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
import { UnifiedForm, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/unified";
import { useFeatureForm } from "@/hooks/use-feature-form";
import { developmentLogger } from "@/lib/logger";
import {
  createClient,
  removeFromCampaign,
  deleteClient,
} from "@features/leads/actions/clients";

const leadFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface NewLeadFormProps {
  campaignId: string;
  client?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    notes?: string | null;
  };
  isEditMode?: boolean;
}

export default function NewLeadForm({
  campaignId,
  client,
  isEditMode = false,
}: NewLeadFormProps) {
  const router = useRouter();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: client?.email || "",
      firstName: client?.firstName || "",
      lastName: client?.lastName || "",
      notes: client?.notes || "",
    },
  });

  const { handleSubmit } = useFeatureForm<LeadFormValues>({
    feature: 'leads',
    trackingEnabled: true,
    onSubmit: async (data) => {
      await createClient({
        email: data.email,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      });
      router.push(`/dashboard/clients?campaignId=${campaignId}`);
      router.refresh();
    },
    onError: (error) => {
      // Error logging for development - replace with proper error handling in production
      if (process.env.NODE_ENV === 'development') {
        developmentLogger.error('Failed to create lead:', error);
      }
    },
  });

  async function handleRemoveFromCampaign() {
    if (!client) return;
    await removeFromCampaign(client.id, campaignId);
    router.push(`/dashboard/clients?campaignId=${campaignId}`);
    router.refresh();
  }

  async function handleDeleteClient() {
    if (!client) return;
    await deleteClient(client.id.toString());
    router.push(`/dashboard/clients?campaignId=${campaignId}`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl mt-6">
      <UnifiedForm
        form={form}
        onSubmit={handleSubmit(form)}
        submitLabel={isEditMode ? "Update Lead" : "Add Client"}
        submitLoadingLabel={isEditMode ? "Updating..." : "Adding..."}
        cancelLabel="Cancel"
        onCancel={() => router.back()}
        showCancelButton={true}
        showSubmitButton={!isEditMode}
        variant="default"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  disabled={isEditMode}
                  placeholder="client@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditMode && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about the client..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </UnifiedForm>

      {isEditMode && (
        <div className="flex gap-4 mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Remove from Campaign</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from Campaign</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the client from this campaign only. The
                  client data will remain in your database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveFromCampaign}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Client</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the client and remove them from
                  all campaigns. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClient}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
