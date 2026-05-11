"use client";
import { createContext, useContext, ReactNode } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  shortAddress: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, connected, connecting, connect, disconnect } = useSolanaWallet();

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        publicKey: publicKey?.toBase58() || null,
        shortAddress,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};
