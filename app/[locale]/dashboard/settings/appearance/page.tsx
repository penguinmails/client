import { AppearanceSettings } from "@features/settings/ui/components";

function page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance Settings</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of the application
        </p>
      </div>
      <AppearanceSettings />
    </div>
  );
}

export default page;

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';