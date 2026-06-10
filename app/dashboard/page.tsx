"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Wallet, Bot, Clock, AlertTriangle, ArrowUpRight, TrendingUp, Zap, Eye, EyeOff, Plus, CheckCircle2, ChevronRight } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { usePermissions } from "@/app/contexts/PermissionContext";
import { useAgents } from "@/app/hooks/useAgents";
import { useI18n } from "@/app/contexts/I18nContext";
import { formatDistanceToNow } from "date-fns";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export default function Overview() {
  const navigate = useRouter();
  const { connected, shortAddress, publicKey } = useWallet(); const address = publicKey;
  const { permissions, activities, revokePermission } = usePermissions();
  const { agents: realAgents } = useAgents(publicKey || undefined);
  const { t } = useI18n();

  const MOCK_AGENTS = realAgents.map(a => ({ id: a.id, name: a.name, status: a.status || "active", nextRun: a.status === "paused" ? t("agent.status.paused") : t("dashboard.scheduled"), permissions: a.permissions?.length || 0 }));

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const activePerms = permissions.filter((p) => p.status === "active");
  const expiringPerms = activePerms.filter(
    (p) => p.expiration.getTime() - Date.now() < 24 * 60 * 60 * 1000
  );
  const activeAgents = MOCK_AGENTS.filter((a) => a.status === "active");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayActions = activities.filter((a) => a.timestamp >= todayStart).length;

  const typeLabels: Record<string, string> = {
    spend: t("ptype.spend"),
    mint: t("ptype.mint"),
    transfer: t("ptype.transfer"),
    execute: t("activity.execute"),
    swap: t("ptype.swap"),
    time_based: t("ptype.timeBased"),
    whitelist: t("ptype.whitelist"),
    custom: t("ptype.custom"),
  };

  useEffect(() => {
    if (!publicKey) { setSolBalance(null); return; }
    setBalanceLoading(true);
    const conn = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    conn.getBalance(new PublicKey(publicKey))
      .then((lamports) => setSolBalance(lamports / LAMPORTS_PER_SOL))
      .catch(() => setSolBalance(null))
      .finally(() => setBalanceLoading(false));
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey || (solBalance !== null && solBalance > 0)) return;
    const conn = new Connection("https://api.devnet.solana.com", "confirmed");
    conn.getBalance(new PublicKey(publicKey))
      .then((lamports) => { if (lamports > 0) setSolBalance(lamports / LAMPORTS_PER_SOL); })
      .catch(() => {});
  }, [publicKey, solBalance]);

  return (
    <div className="space-y-6 animate-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("overview.welcome")}</p>
          <h1 className="hidden md:block text-2xl font-bold tracking-tight mt-0.5">{t("overview.title")}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t("overview.systemActive")}
        </div>
      </div>

      {/* Expiring Alert */}
      {expiringPerms.length > 0 && (
        <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm font-medium text-warning flex-1">
            {expiringPerms.length} {expiringPerms.length > 1 ? t("overview.permExpiresPlural") : t("overview.permExpiresSingular")} — {t("dashboard.expiring24h")}
          </p>
          <button
            onClick={() => navigate.push("/permissions")}
            className="text-xs font-semibold text-warning underline shrink-0"
          >
            {t("dashboard.view")}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div onClick={() => navigate.push("/permissions")} className="stat-card cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
          <div className="p-2 rounded-xl bg-primary/10 w-fit mb-3"><Shield className="w-4 h-4 text-primary" /></div>
          <p className="text-2xl font-bold kixa-gradient-text">{activePerms.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("overview.activePerms")}</p>
          {expiringPerms.length > 0 && (
            <p className="text-[10px] text-warning mt-1 font-medium">{expiringPerms.length} {t("overview.expiringSoon")}</p>
          )}
        </div>

        <div onClick={() => navigate.push("/agents")} className="stat-card cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
          <div className="p-2 rounded-xl bg-primary/10 w-fit mb-3"><Bot className="w-4 h-4 text-primary" /></div>
          <p className="text-2xl font-bold kixa-gradient-text">{MOCK_AGENTS.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.totalAgents")}</p>
          <p className="text-[10px] text-success mt-1 font-medium">{activeAgents.length} {t("dashboard.running")}</p>
        </div>

        <div onClick={() => navigate.push("/activity")} className="stat-card cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
          <div className="p-2 rounded-xl bg-primary/10 w-fit mb-3"><Zap className="w-4 h-4 text-primary" /></div>
          <p className="text-2xl font-bold kixa-gradient-text">{todayActions}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.executionsToday")}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{activities.length} {t("dashboard.totalEvents")}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-primary/10 w-fit"><Wallet className="w-4 h-4 text-primary" /></div>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
              {balanceVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-2xl font-bold kixa-gradient-text">
            {!connected ? "—" : balanceLoading ? "..." : balanceVisible ? (solBalance !== null ? solBalance.toFixed(3) : "0.000") : "•••"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.solBalance")}</p>
          {connected && (
            <p onClick={() => address && window.open(`https://explorer.solana.com/address/${address}`, "_blank")}
              className="text-[10px] text-primary mt-1 font-medium cursor-pointer hover:underline flex items-center gap-0.5">
              {shortAddress} <ArrowUpRight className="w-3 h-3" />
            </p>
          )}
        </div>
      </div>

      {/* Agents */}
      <div className="stat-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10"><Bot className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm font-semibold">{t("dashboard.yourAgents")}</p>
              <p className="text-xs text-muted-foreground">{activeAgents.length} {t("actPage.of")} {MOCK_AGENTS.length} {t("dashboard.running")}</p>
            </div>
          </div>
          <button onClick={() => navigate.push("/agent/create")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {t("dashboard.newAgent")}
          </button>
        </div>

        <div className="space-y-2">
          {MOCK_AGENTS.map((agent) => (
            <div key={agent.id} onClick={() => navigate.push("/agents")}
              className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${agent.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" /> {agent.nextRun}
                  <span className="mx-1">·</span>
                  <CheckCircle2 className="w-3 h-3" /> {agent.permissions} {t("dashboard.permCount")}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${agent.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {agent.status === "active" ? t("status.active").toUpperCase() : t("agent.status.paused").toUpperCase()}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Expiring + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/10"><AlertTriangle className="w-5 h-5 text-warning" /></div>
              <div>
                <p className="text-sm font-semibold">{t("dashboard.expiringSoonTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.needsAttention")}</p>
              </div>
            </div>
            <button onClick={() => navigate.push("/permissions")} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {expiringPerms.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("dashboard.allHealthy")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiringPerms.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <div>
                    <p className="text-sm font-medium">{typeLabels[p.type] || p.type}</p>
                    <p className="text-xs text-muted-foreground">{p.limit} SOL · {t("overview.expiresIn")} {formatDistanceToNow(p.expiration)}</p>
                  </div>
                  <button onClick={() => navigate.push("/permissions")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    {t("overview.renew")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stat-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm font-semibold">{t("dashboard.recentPerms")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.latestCreated")}</p>
              </div>
            </div>
            <button onClick={() => navigate.push("/permissions")} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {permissions.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${p.status === "active" ? "bg-success" : p.status === "expiring" ? "bg-warning" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium">{typeLabels[p.type] || p.type}</p>
                    <p className="text-xs text-muted-foreground">{p.limit} SOL · {p.agent}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-success/10 text-success" : p.status === "expiring" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {t(`status.${p.status}` as any)?.toUpperCase() || p.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="stat-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10"><Clock className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm font-semibold">{t("overview.recentActivity")}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.latestAgentActions")}</p>
            </div>
          </div>
          <button onClick={() => navigate.push("/activity")} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
            {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("overview.noActivity")}</p>
          ) : (
            activities.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${a.status === "success" ? "bg-success" : a.status === "failed" ? "bg-destructive" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium">{a.description}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(a.timestamp, { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
