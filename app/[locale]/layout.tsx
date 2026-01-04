
import { AuthProvider } from "@features/auth/ui/context/auth-context";
import { AppProviders } from "@/shared/components/providers";

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProviders>
  );
}
