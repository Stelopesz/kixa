import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KiraPermissions } from "../target/types/kira_permissions";
import { assert } from "chai";

describe("kira_permissions", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.KiraPermissions as Program<KiraPermissions>;
  const owner = anchor.AnchorProvider.env().wallet;

  const agentId = "gpt-4-agent";
  const scope = "read:calendar,write:tasks";
  const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // +24h

  const [permissionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("permission"), owner.publicKey.toBuffer(), Buffer.from(agentId)],
    program.programId
  );

  it("✅ Grant permission", async () => {
    await program.methods
      .grantPermission(agentId, scope, expiresAt)
      .accounts({ permission: permissionPda, owner: owner.publicKey })
      .rpc();

    const record = await program.account.permissionRecord.fetch(permissionPda);
    assert.equal(record.agentId, agentId);
    assert.equal(record.scope, scope);
    assert.isTrue(record.isActive);
    console.log("✅ Permission granted for:", record.agentId);
  });

  it("✅ Check permission (valid)", async () => {
    const record = await program.account.permissionRecord.fetch(permissionPda);
    assert.isTrue(record.isActive);
    console.log("✅ Permission is active, expires at:", record.expiresAt.toString());
  });

  it("✅ Revoke permission", async () => {
    await program.methods
      .revokePermission()
      .accounts({ permission: permissionPda, owner: owner.publicKey })
      .rpc();

    const record = await program.account.permissionRecord.fetch(permissionPda);
    assert.isFalse(record.isActive);
    console.log("✅ Permission revoked for:", record.agentId);
  });
});