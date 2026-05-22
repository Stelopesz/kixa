"use client";
import { I18nProvider } from "@/app/contexts/I18nContext";
import { PermissionProvider } from "@/app/contexts/PermissionContext";
import ClientWalletProvider from "@/app/components/WalletProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
<ClientWalletProvider>
        <I18nProvider>
          <PermissionProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                },
                classNames: {
                  success: "!border-green-500/30",
                  error: "!border-red-500/30",
                },
              }}
            />
          </PermissionProvider>
        </I18nProvider>
      </ClientWalletProvider>
  );
}
