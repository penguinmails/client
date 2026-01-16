
import { AuthProvider } from "@features/auth/ui/context/auth-provider";
import { AppProviders } from "@/components/providers";

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
