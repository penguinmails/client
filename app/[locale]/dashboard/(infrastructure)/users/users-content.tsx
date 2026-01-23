"use client";

import PanelUserManager from "@/features/infrastructure/ui/components/users/PanelUserManager";

interface UsersContentProps {
  title: string;
  description: string;
}

export default function UsersContent({ title, description }: UsersContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <PanelUserManager />
    </div>
  );
}
