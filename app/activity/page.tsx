"use client";
import { useState, useMemo } from "react";
import { usePermissions } from "@/app/contexts/PermissionContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { Shield, XCircle, Clock, Search, Plus, DollarSign, Image, ArrowRightLeft, Code, ShieldCheck, Pencil, Sparkles } from "lucide-react";
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from "date-fns";
import { enUS, ptBR, es } from "date-fns/locale";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { useRouter } from "next/navigation";

const typeIcons: Record<string, { icon: React.ElementType; emoji: string }> = {
  spend:      { icon: DollarSign,     emoji: "💸" },
  swap:       { icon: ArrowRightLeft, emoji: "🔄" },
  mint:       { icon: Image,          emoji: "🖼️" },
  time_based: { icon: Clock,          emoji: "⏰" },
  whitelist:  { icon: ShieldCheck,    emoji: "🛡️" },
  custom:     { icon: Pencil,         emoji: "✏️" },
  transfer:   { icon: ArrowRightLeft, emoji: "↗️" },
  execute:    { icon: Code,           emoji: "⚡" },
};

type TimeFilter = "all" | "today" | "week" | "month";
type TypeFilter = "all" | "created" | "revoked" | "expired";

export default function ActivityPage() {
  const { activities, permissions } = usePermissions();
  const { t, locale } = useI18n();
  const navigate = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const dateFnsLocale = locale === "pt" ? ptBR : locale === "es" ? es : enUS;

  const eventConfig: Record<string, { icon: React.ElementType; color: string; bg: string; badgeClass: string }> = {
    spend:    { icon: DollarSign, color: "text-primary",          bg: "bg-primary/10",     badgeClass: "bg-primary/15 text-primary border-primary/20" },
    mint:     { icon: Image,      color: "text-purple-400",       bg: "bg-purple-400/10",  badgeClass: "bg-purple-400/15 text-purple-400 border-purple-400/20" },
    transfer: { icon: ArrowRightLeft, color: "text-blue-400",     bg: "bg-blue-400/10",    badgeClass: "bg-blue-400/15 text-blue-400 border-blue-400/20" },
    revoked:  { icon: XCircle,    color: "text-destructive",      bg: "bg-destructive/10", badgeClass: "bg-destructive/15 text-destructive border-destructive/20" },
    expired:  { icon: Clock,      color: "text-muted-foreground", bg: "bg-muted",          badgeClass: "bg-muted text-muted-foreground border-border" },
  };

  const filtered = useMemo(() => {
    let list = [...activities];

    if (timeFilter === "today") list = list.filter(a => isToday(a.timestamp));
    else if (timeFilter === "week") list = list.filter(a => isThisWeek(a.timestamp));
    else if (timeFilter === "month") list = list.filter(a => isThisMonth(a.timestamp));

    if (typeFilter !== "all") list = list.filter(a => a.type === typeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.type.toLowerCase().includes(q) ||
        (a.permissionId && a.permissionId.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, timeFilter, typeFilter, search]);

  const timeCounts = useMemo(() => ({
    all:   activities.length,
    today: activities.filter(a => isToday(a.timestamp)).length,
    week:  activities.filter(a => isThisWeek(a.timestamp)).length,
    month: activities.filter(a => isThisMonth(a.timestamp)).length,
  }), [activities]);

  const typeCounts = useMemo(() => ({
    all:     activities.length,
    created: activities.filter(a => a.type === "created").length,
    revoked: activities.filter(a => a.type === "revoked").length,
    expired: activities.filter(a => a.type === "expired").length,
  }), [activities]);

  const timeLabels: Record<TimeFilter, string> = {
    all:   t("filter.all"),
    today: t("actPage.today") || "Today",
    week:  t("actPage.week") || "This Week",
    month: t("actPage.month") || "This Month",
  };

  const typeLabels: Record<TypeFilter, string> = {
    all:     t("filter.all"),
    created: t("activity.created"),
    revoked: t("activity.revoked"),
    expired: t("activity.expired"),
  };

  const typeDisplayLabels: Record<string, string> = {
    spend:    t("ptype.spend"),
    mint:     t("ptype.mint"),
    transfer: t("ptype.transfer"),
    execute:  t("ptype.spend"),
    swap:     t("ptype.swap"),
    custom:   t("ptype.custom"),
  };

  return (
    <div className="space-y-5 sm:space-y-6 overflow-x-hidden">

      {/* Header */}
      <div className="animate-in">
        <h1 className="hidden md:block text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground md:mt-1">Track agent actions</p>
      </div>

      {/* Time Tabs */}
      <div className="animate-in space-y-3">
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="w-full bg-muted/50 p-1">
            {(["all", "today", "week", "month"] as TimeFilter[]).map(f => (
              <TabsTrigger key={f} value={f} className="flex-1 text-xs gap-1 px-2">
                {timeLabels[f]}
                <span className="text-[10px] opacity-60">{timeCounts[f]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Type filter + Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grid grid-cols-4 gap-2">
            {(["all", "created", "revoked", "expired"] as TypeFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all text-center ${
                  typeFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {typeLabels[f]} {typeCounts[f]}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="pl-9 h-9 text-sm bg-muted/30 border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-medium text-muted-foreground mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground/70 max-w-xs mb-4">
            Agent actions will appear here
          </p>
          <button
            onClick={() => navigate.push("/permissions?create=true")}
            className="inline-flex items-center gap-2 px-6 py-3 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            Create Permission
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/50" />
          <div className="space-y-0.5">
            {filtered.map((a, i) => {
              const config = eventConfig[a.type] || eventConfig["expired"];
              const Icon = config.icon;
              const perm = permissions.find(p => p.id === a.permissionId);
              const typeInfo = typeIcons[a.type] || { icon: Sparkles, emoji: "✨" };
              const typeLabel = typeDisplayLabels[a.type] || a.type;

              return (
                <div
                  key={a.id}
                  className="relative flex gap-4 py-4 animate-in group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass-surface p-4 rounded-xl space-y-2 transition-all group-hover:border-border/60">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{a.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(a.timestamp, { addSuffix: true, locale: dateFnsLocale })}
                        </p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] ${config.badgeClass}`}>
                        {typeLabel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
                      <span className="font-mono">
                        {a.permissionId ? a.permissionId.slice(0, 8) + '...' : 'N/A'}
                      </span>
                      <span>·</span>
                      <span>{format(a.timestamp, "MMM d, HH:mm", { locale: dateFnsLocale })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
