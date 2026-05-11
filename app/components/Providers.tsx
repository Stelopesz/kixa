"use client";
import { I18nProvider } from "@/app/contexts/I18nContext";
import { PermissionProvider } from "@/app/contexts/PermissionContext";
import ClientWalletProvider from "@/app/components/WalletProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientWalletProvider>
        <I18nProvider>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </I18nProvider>
      </ClientWalletProvider>
    </QueryClientProvider>
  );
}
