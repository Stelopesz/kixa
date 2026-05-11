"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, XCircle, RefreshCw, Eye, EyeOff, DollarSign, Image, ArrowRightLeft, Code, Clock, ShieldCheck, Pencil, Sparkles } from "lucide-react";
import { usePermissions, Permission } from "@/app/contexts/PermissionContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { format, formatDistanceToNow, differenceInMilliseconds } from "date-fns";
import { enUS, ptBR, es } from "date-fns/locale";
import CreatePermissionModal from "@/app/components/CreatePermissionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

/* ─── Config ─── */
const typeConfig: Record<string, { icon: React.ElementType; emoji: string; labelKey: string; descKey: string }> = {
  spend:      { icon: DollarSign,    emoji: "💸", labelKey: "ptype.spend",    descKey: "ptype.spendDesc" },
  swap:       { icon: ArrowRightLeft, emoji: "🔄", labelKey: "ptype.swap",     descKey: "ptype.swapDesc" },
  mint:       { icon: Image,         emoji: "🖼️", labelKey: "ptype.mint",     descKey: "ptype.mintDesc" },
  time_based: { icon: Clock,         emoji: "⏰", labelKey: "ptype.timeBased", descKey: "ptype.timeBasedDesc" },
  whitelist:  { icon: ShieldCheck,   emoji: "🛡️", labelKey: "ptype.whitelist", descKey: "ptype.whitelistDesc" },
  custom:     { icon: Pencil,        emoji: "⚙️", labelKey: "ptype.custom",    descKey: "ptype.customDesc" },
  transfer:   { icon: ArrowRightLeft, emoji: "↗️", labelKey: "ptype.transfer",  descKey: "ptype.transferDesc" },
  execute:    { icon: Code,          emoji: "⚡", labelKey: "ptype.execute",   descKey: "ptype.executeDesc" },
};

type FilterTab = "all" | "active" | "expiring" | "expired" | "revoked";

const tabKeys: { value: FilterTab; labelKey: string }[] = [
  { value: "all", labelKey: "filter.all" },
  { value: "active", labelKey: "filter.active" },
  { value: "expiring", labelKey: "filter.expiring" },
  { value: "expired", labelKey: "filter.expired" },
  { value: "revoked", labelKey: "filter.revoked" },
];

const dateFnsLocales: Record<string, any> = { en: enUS, pt: ptBR, es };

/* ─── Helpers ─── */
function getEffectiveStatus(p: Permission): "active" | "expiring" | "expired" | "revoked" {
  if (p.status === "revoked") return "revoked";
  if (p.expiration.getTime() < Date.now()) return "expired";
  if (p.expiration.getTime() - Date.now() < 24 * 60 * 60 * 1000) return "expiring";
  return "active";
}

function getTimeProgress(p: Permission): number {
  const total = differenceInMilliseconds(p.expiration, p.createdAt);
  const elapsed = differenceInMilliseconds(new Date(), p.createdAt);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

const statusOrder: Record<string, number> = { expiring: 0, active: 1, expired: 2, revoked: 3 };

function getStatusColor(status: string) {
  switch (status) {
    case "active": return { badge: "bg-success/10 text-success border-success/20", bar: "bg-success", dot: "bg-success" };
    case "expiring": return { badge: "bg-warning/10 text-warning border-warning/20", bar: "bg-warning", dot: "bg-warning" };
    case "expired": return { badge: "bg-muted text-muted-foreground border-border/50", bar: "bg-muted-foreground/30", dot: "bg-muted-foreground" };
    case "revoked": return { badge: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive/30", dot: "bg-destructive" };
    default: return { badge: "bg-muted text-muted-foreground border-border/50", bar: "bg-muted", dot: "bg-muted-foreground" };
  }
}

/* ─── Component ─── */
export default function Permissions() {
  const { permissions, revokePermission } = usePermissions();
  const { t, locale } = useI18n();
  const dfLocale = dateFnsLocales[locale] || enUS;
  const [showCreate, setShowCreate] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreate(true);
    }
  }, [searchParams]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const statusLabelKeys: Record<string, string> = {
    active: "status.active",
    expiring: "status.expiring",
    expired: "status.expired",
    revoked: "status.revoked",
  };

  const enriched = useMemo(() => {
    return permissions.map((p) => ({
      ...p,
      effectiveStatus: getEffectiveStatus(p),
      progress: getTimeProgress(p),
      config: typeConfig[p.type] || typeConfig.spend,
    }));
  }, [permissions]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (activeTab !== "all") {
      list = list.filter((p) => p.effectiveStatus === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          t(p.config.labelKey as any).toLowerCase().includes(q) ||
          p.agentName.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => statusOrder[a.effectiveStatus] - statusOrder[b.effectiveStatus]);
  }, [enriched, activeTab, search, t]);

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = { all: enriched.length, active: 0, expiring: 0, expired: 0, revoked: 0 };
    enriched.forEach((p) => { counts[p.effectiveStatus]++; });
    return counts;
  }, [enriched]);

  return (
    <div className="space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 animate-in sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="hidden md:block text-2xl font-semibold tracking-tight">{t("perms.title")}</h1>
          <p className="text-sm text-muted-foreground md:mt-1">{t("perms.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all active:scale-[0.97] touch-target h-11"
        >
          <Plus className="w-4 h-4" />
          {t("perms.create")}
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 animate-in" style={{ animationDelay: "60ms" }}>
        <div className="grid grid-cols-5 gap-2">
          {tabKeys.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-2 py-2.5 rounded-xl text-[11px] font-medium transition-all text-center whitespace-nowrap ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(tab.labelKey as any)} {tabCounts[tab.value]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search.placeholder" as any)}
            className="w-full pl-10 pr-4 py-3 h-11 rounded-xl bg-muted/30 border border-border/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-in">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="w-9 h-9 text-primary/40" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {search || activeTab !== "all" ? t("empty.noResults" as any) : t("empty.noPerms" as any)}
          </p>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
            {search || activeTab !== "all"
              ? t("empty.noResultsDesc" as any)
              : t("empty.noPermsDesc" as any)
            }
          </p>
          {!search && activeTab === "all" && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97] touch-target"
            >
              <Plus className="w-4 h-4" />
              {t("empty.createFirst" as any)}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const Icon = p.config.icon;
            const colors = getStatusColor(p.effectiveStatus);
            const isExpanded = expanded === p.id;
            const isActionable = p.effectiveStatus === "active" || p.effectiveStatus === "expiring";

            return (
              <div
                key={p.id}
                className="glass-card p-5 transition-all duration-300 animate-in overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Top row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{t(p.config.labelKey as any)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(p.config.descKey as any)}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {t(statusLabelKeys[p.effectiveStatus] as any)}
                  </span>
                </div>

                {/* Info row */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {t("card.token" as any)}: <strong className="text-foreground">SOL</strong>
                  </span>
                  <span>
                    {t("card.limit" as any)}: <strong className="text-foreground">{p.limit} SOL</strong>
                  </span>
                  <span>
                    {p.effectiveStatus === "expired" || p.effectiveStatus === "revoked"
                      ? `${t("card.expired" as any)} ${formatDistanceToNow(p.expiration, { addSuffix: true, locale: dfLocale })}`
                      : `${t("card.expires" as any)} ${formatDistanceToNow(p.expiration, { addSuffix: true, locale: dfLocale })}`
                    }
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                    <span>{format(p.createdAt, "dd MMM", { locale: dfLocale })}</span>
                    <span>{format(p.expiration, "dd MMM yyyy", { locale: dfLocale })}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                {/* Agent */}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {t("card.agent" as any)}: <span className="font-medium text-foreground">{p.agentName}</span>
                </p>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground space-y-2 overflow-hidden border border-border/30">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">ID</p>
                      <p className="font-mono break-all leading-relaxed">{p.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Hash</p>
                      <p className="font-mono break-all leading-relaxed">{p.hash}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Wallet</p>
                      <p className="font-mono">{p.walletAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">{t("card.createdAt" as any)}</p>
                      <p className="font-mono">{format(p.createdAt, "PPpp", { locale: dfLocale })}</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors touch-target"
                  >
                    {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {isExpanded ? t("card.hide" as any) : t("card.details" as any)}
                  </button>

                  {isActionable && (
                    <>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors touch-target"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t("card.renew" as any)}
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors touch-target">
                            <XCircle className="w-3.5 h-3.5" />
                            {t("card.revoke" as any)}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("revoke.title" as any)}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("revoke.desc" as any)} <strong>{t(p.config.labelKey as any)} — {p.limit} SOL</strong>. {t("revoke.descSuffix" as any)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("revoke.cancel" as any)}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revokePermission(p.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("revoke.confirmBtn" as any)}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreatePermissionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
