import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@coral-xyz/anchor";
import idl from "./idl.json";

const PROGRAM_ID = new PublicKey(
  "2dss4aR8pXV9dJP5Y3dL2ZVcL3W4NWNynCMfLojmVPLx"
);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl as any, provider);
}

export async function grantPermission(
  wallet: any,
  agentId: string,
  scope: string,
  expiresAt: number
) {
  const program = getProgram(wallet);
  const [permissionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("permission"),
      wallet.publicKey.toBuffer(),
      Buffer.from(agentId),
    ],
    PROGRAM_ID
  );

  const tx = await program.methods
    .grantPermission(agentId, scope, new BN(expiresAt))
    .accounts({
      permission: permissionPDA,
      owner: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function revokePermission(wallet: any, agentId: string) {
  const program = getProgram(wallet);
  const [permissionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("permission"),
      wallet.publicKey.toBuffer(),
      Buffer.from(agentId),
    ],
    PROGRAM_ID
  );

  const tx = await program.methods
    .revokePermission()
    .accounts({
      permission: permissionPDA,
      owner: wallet.publicKey,
    })
    .rpc();

  return tx;
}

export async function checkPermission(
  wallet: any,
  agentId: string
): Promise<boolean> {
  const program = getProgram(wallet);
  const [permissionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("permission"),
      wallet.publicKey.toBuffer(),
      Buffer.from(agentId),
    ],
    PROGRAM_ID
  );

  try {
    const permission = await (program.account as any).permissionRecord.fetch(
      permissionPDA
    );
    const now = Math.floor(Date.now() / 1000);
    return permission.isActive && permission.expiresAt.toNumber() > now;
  } catch {
    return false;
  }
}

export async function getPermissions(wallet: any) {
  const program = getProgram(wallet);
  const permissions = await (program.account as any).permissionRecord.all([
    {
      memcmp: {
        offset: 8,
        bytes: wallet.publicKey.toBase58(),
      },
    },
  ]);
  return permissions;
}