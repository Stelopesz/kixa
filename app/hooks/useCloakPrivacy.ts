"use client";
import { useCallback } from "react";
import { useWallet } from "@/app/contexts/WalletContext";

// Cloak SDK - Private transfers on Solana
// https://cloak.mintlify.app/sdk/quickstart

export interface CloakTransferParams {
  recipientAddress: string;
  amountLamports: bigint;
  tokenMint?: string; // default SOL
}

export interface CloakViewingKey {
  key: string;
  createdAt: number;
  label: string;
}

export function useCloakPrivacy() {
  const { publicKey } = useWallet();

  const executePrivateTransfer = useCallback(async (params: CloakTransferParams) => {
    if (!publicKey) throw new Error("Wallet not connected");

    try {
      const {
        CLOAK_PROGRAM_ID,
        NATIVE_SOL_MINT,
        createUtxo,
        createZeroUtxo,
        generateUtxoKeypair,
        transact,
      } = await import("@cloak.dev/sdk");

      const { Connection, PublicKey } = await import("@solana/web3.js");

      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

      const owner = await generateUtxoKeypair();
      const depositOutput = await createUtxo(
        params.amountLamports,
        owner,
        NATIVE_SOL_MINT
      );

      const result = await transact(
        {
          inputUtxos: [await createZeroUtxo(NATIVE_SOL_MINT)],
          outputUtxos: [depositOutput],
          externalAmount: params.amountLamports,
          depositor: new PublicKey(publicKey),
        },
        {
          connection,
          programId: CLOAK_PROGRAM_ID,
          walletPublicKey: new PublicKey(publicKey),
        }
      );

      return { success: true, txHash: result, viewingKey: owner };
    } catch (err) {
      console.error("Cloak transfer error:", err);
      throw err;
    }
  }, [publicKey]);

  const generateViewingKey = useCallback(async (label: string): Promise<CloakViewingKey> => {
    const { generateUtxoKeypair } = await import("@cloak.dev/sdk");
    const keypair = await generateUtxoKeypair();
    return {
      key: JSON.stringify(keypair),
      createdAt: Date.now(),
      label,
    };
  }, []);

  return { executePrivateTransfer, generateViewingKey };
}
