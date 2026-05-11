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
    {
      name: "grant_permission",
      discriminator: [50,6,1,242,15,73,99,164],
      accounts: [
        { name: "permission", writable: true, pda: { seeds: [{ kind: "const", value: [112,101,114,109,105,115,115,105,111,110] }, { kind: "account", path: "owner" }, { kind: "arg", path: "agent_id" }] } },
        { name: "owner", writable: true, signer: true },
        { name: "fee_receiver", writable: true },
        { name: "system_program", address: "11111111111111111111111111111111" }
      ],
      args: [{ name: "agent_id", type: "string" }, { name: "scope", type: "string" }, { name: "expires_at", type: "i64" }, { name: "is_new_agent", type: "bool" }]
    },
    {
      name: "revoke_permission",
      discriminator: [116,82,33,181,121,144,249,227],
      accounts: [
        { name: "permission", writable: true, pda: { seeds: [{ kind: "const", value: [112,101,114,109,105,115,115,105,111,110] }, { kind: "account", path: "owner" }, { kind: "account", path: "permission.agent_id" }] } },
        { name: "owner", signer: true }
      ],
      args: []
    },
    {
      name: "check_permission",
      discriminator: [154,199,232,242,96,72,197,236],
      accounts: [{ name: "permission" }],
      args: [],
      returns: "bool"
    }
  ],
  accounts: [{ name: "PermissionRecord", discriminator: [185,100,213,50,206,15,144,86] }],
  types: [{ name: "PermissionRecord", type: { kind: "struct", fields: [{ name: "owner", type: "pubkey" }, { name: "agent_id", type: "string" }, { name: "scope", type: "string" }, { name: "expires_at", type: "i64" }, { name: "granted_at", type: "i64" }, { name: "is_active", type: "bool" }, { name: "is_new_agent", type: "bool" }] } }],
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
      .grant_permission(agentId, scope, expiresAt, isNewAgent)
      .accounts({ permission: permissionPda, owner: new PublicKey(walletPublicKey!), feeReceiver: new PublicKey("54CHdx2ew1B2ZhZ3eb53xCWoDEhXYyoRCtqkF8gtEn7S"), systemProgram: web3.SystemProgram.programId })
      .rpc();
    console.log("✅ grant_permission tx:", tx);
    return { tx, permissionPda: permissionPda.toBase58() };
  }, [getProgram, getPermissionPda, walletPublicKey]);

  const revokePermission = useCallback(async (agentId: string) => {
    const program = getProgram();
    const permissionPda = getPermissionPda(agentId);
    const tx = await program.methods
      .revoke_permission()
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