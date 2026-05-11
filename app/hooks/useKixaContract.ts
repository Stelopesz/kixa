import { useCallback } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { useWallet } from "@/app/contexts/WalletContext";

const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("2dss4aR8pXV9dJP5Y3dL2ZVcL3W4NWNynCMfLojmVPLx");

const IDL = {
  address: "2dss4aR8pXV9dJP5Y3dL2ZVcL3W4NWNynCMfLojmVPLx",
  metadata: { name: "kira_permissions", version: "0.1.0", spec: "0.1.0" },
  instructions: [
    { name: "grantPermission", discriminator: [0,0,0,0,0,0,0,0], accounts: [{ name: "permission", writable: true, pda: { seeds: [{ kind: "const", value: [112,101,114,109,105,115,115,105,111,110] }, { kind: "account", path: "owner" }, { kind: "arg", path: "agentId" }] } }, { name: "owner", writable: true, signer: true }, { name: "feeReceiver", writable: true }, { name: "systemProgram", address: "11111111111111111111111111111111" }], args: [{ name: "agentId", type: "string" }, { name: "scope", type: "string" }, { name: "expiresAt", type: "i64" }, { name: "isNewAgent", type: "bool" }] },
    { name: "revokePermission", discriminator: [0,0,0,0,0,0,0,1], accounts: [{ name: "permission", writable: true, pda: { seeds: [{ kind: "const", value: [112,101,114,109,105,115,115,105,111,110] }, { kind: "account", path: "owner" }, { kind: "account", path: "permission", field: "agentId" }] } }, { name: "owner", signer: true }], args: [] },
    { name: "checkPermission", discriminator: [0,0,0,0,0,0,0,2], accounts: [{ name: "permission" }], args: [] }
  ],
  accounts: [{ name: "PermissionRecord", discriminator: [0,0,0,0,0,0,0,3] }],
  types: [{ name: "PermissionRecord", type: { kind: "struct", fields: [{ name: "owner", type: "pubkey" }, { name: "agentId", type: "string" }, { name: "scope", type: "string" }, { name: "expiresAt", type: "i64" }, { name: "grantedAt", type: "i64" }, { name: "isActive", type: "bool" }] } }],
  errors: [{ code: 6000, name: "Unauthorized", msg: "You are not authorized to perform this action" }]
};

export interface GrantParams {
  agentId: string;
  scope: string;
  expiresInHours: number;
  isNewAgent?: boolean;
}

export function useKixaContract() {
  const { publicKey: walletPublicKey } = useWallet();

  const getProgram = useCallback(() => {
    if (!walletPublicKey) throw new Error("Wallet not connected");
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = {
      publicKey: new PublicKey(walletPublicKey!),
      signTransaction: async (tx: any) => {
        const provider = (window as any).solana || (window as any).phantom?.solana;
        return provider.signTransaction(tx);
      },
      signAllTransactions: async (txs: any[]) => {
        const provider = (window as any).solana || (window as any).phantom?.solana;
        return provider.signAllTransactions(txs);
      },
    };
    const anchorProvider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    return new Program(IDL as any, anchorProvider);
  }, [walletPublicKey]);

  const getPermissionPda = useCallback((agentId: string) => {
    if (!walletPublicKey) throw new Error("Wallet not connected");
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("permission"), new PublicKey(walletPublicKey!).toBuffer(), Buffer.from(agentId)],
      PROGRAM_ID
    );
    return pda;
  }, [walletPublicKey]);

  const grantPermission = useCallback(async ({ agentId, scope, expiresInHours, isNewAgent = false }: GrantParams) => {
    const program = getProgram();
    const permissionPda = getPermissionPda(agentId);
    const expiresAt = new BN(Math.floor(Date.now() / 1000) + expiresInHours * 3600);
    const tx = await program.methods
      .grantPermission(agentId, scope, expiresAt, isNewAgent)
      .accounts({ permission: permissionPda, owner: new PublicKey(walletPublicKey!), feeReceiver: new PublicKey("54CHdx2ew1B2ZhZ3eb53xCWoDEhXYyoRCtqkF8gtEn7S"), systemProgram: web3.SystemProgram.programId })
      .rpc();
    console.log("✅ grant_permission tx:", tx);
    return { tx, permissionPda: permissionPda.toBase58() };
  }, [getProgram, getPermissionPda, walletPublicKey]);

  const revokePermission = useCallback(async (agentId: string) => {
    const program = getProgram();
    const permissionPda = getPermissionPda(agentId);
    const tx = await program.methods
      .revokePermission()
      .accounts({ permission: permissionPda, owner: new PublicKey(walletPublicKey!) })
      .rpc();
    console.log("✅ revoke_permission tx:", tx);
    return tx;
  }, [getProgram, getPermissionPda, walletPublicKey]);

  const fetchMyPermissions = useCallback(async () => {
    if (!walletPublicKey) return [];
    const program = getProgram();
    const all = await (program.account as any)["permissionRecord"].all([
      { memcmp: { offset: 8, bytes: new PublicKey(walletPublicKey!).toBase58() } }
    ]);
    return all.map((p: any) => ({ pda: p.publicKey.toBase58(), ...p.account }));
  }, [getProgram, walletPublicKey]);

  return { grantPermission, revokePermission, fetchMyPermissions };
}