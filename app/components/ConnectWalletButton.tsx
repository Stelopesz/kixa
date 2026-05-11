"use client";
import { useWallet } from "@/app/contexts/WalletContext";
import { Wallet, LogOut } from "lucide-react";

interface ConnectWalletButtonProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function ConnectWalletButton({ variant = "default", className = "" }: ConnectWalletButtonProps) {
  const { connected, disconnect, shortAddress, connecting, connect } = useWallet();

  if (connected) {
    return (
      <div className={"flex items-center gap-2 " + className}>
        <span className="text-sm font-mono text-muted-foreground">{shortAddress}</span>
        <button
          onClick={disconnect}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className={"flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 " + className}
    >
      <Wallet className="w-4 h-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
