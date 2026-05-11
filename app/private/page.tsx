"use client";
import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, Send, Key } from "lucide-react";
import { useI18n } from "@/app/contexts/I18nContext";
import { useCloakPrivacy } from "@/app/hooks/useCloakPrivacy";
import AppLayout from "@/app/components/AppLayout";

export default function PrivatePage() {
  const { t } = useI18n();
  const { executePrivateTransfer, generateViewingKey } = useCloakPrivacy();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [viewingKey, setViewingKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setLoading(true);
    try {
      const amountLamports = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));
      const result = await executePrivateTransfer({ recipientAddress: recipient, amountLamports });
      setTxHash(result.txHash as string);
      const vk = await generateViewingKey(`Transfer ${amount} SOL`);
      setViewingKey(vk.key);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(183,78,111,0.1)" }}>
              <Lock size={20} color="#b74e6f" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Private Transfer</h1>
          </div>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 14 }}>
            Send SOL privately using Cloak — amounts and addresses hidden on-chain
          </p>
        </div>

        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: "rgba(183,78,111,0.05)", borderRadius: 8, border: "1px solid rgba(183,78,111,0.2)" }}>
            <Shield size={14} color="#b74e6f" />
            <span style={{ fontSize: 12, color: "#b74e6f", fontWeight: 500 }}>Powered by Cloak Protocol — ZK shielded pool on Solana</span>
          </div>

          {!success ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: 6, display: "block" }}>Recipient Address</label>
                <input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="Solana wallet address..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: 6, display: "block" }}>Amount (SOL)</label>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", fontSize: 16, fontWeight: 600, boxSizing: "border-box" }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !recipient || !amount}
                style={{ padding: "14px", borderRadius: 12, background: "#b74e6f", color: "#fff", border: "none", cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !recipient || !amount ? 0.5 : 1 }}
              >
                <Lock size={16} />
                {loading ? "Shielding transaction..." : "Send Privately"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Shield size={24} color="#22c55e" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Transfer Shielded ✓</p>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
                {amount} SOL sent privately. No amounts or addresses visible on-chain.
              </p>

              {viewingKey && (
                <div style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 16, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Key size={14} color="#b74e6f" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#b74e6f" }}>Viewing Key (Audit Trail)</span>
                    </div>
                    <button onClick={() => setShowKey(!showKey)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))" }}>
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginBottom: 8 }}>
                    Share this key with auditors or regulators to prove the transfer without revealing it publicly.
                  </p>
                  {showKey && (
                    <code style={{ fontSize: 10, wordBreak: "break-all", color: "hsl(var(--foreground))", display: "block" }}>
                      {viewingKey.substring(0, 80)}...
                    </code>
                  )}
                </div>
              )}

              <button onClick={() => { setSuccess(false); setRecipient(""); setAmount(""); setViewingKey(null); }} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "transparent", border: "1px solid hsl(var(--border))", cursor: "pointer", fontSize: 13 }}>
                New Transfer
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: 16, background: "rgba(183,78,111,0.05)", borderRadius: 12, border: "1px solid rgba(183,78,111,0.1)" }}>
          <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
            <strong>How it works:</strong> Cloak uses a UTXO shielded pool with Groth16 ZK proofs generated client-side. Transactions are submitted via relay without custody. Viewing keys enable selective disclosure for compliance.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
