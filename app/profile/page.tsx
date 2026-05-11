"use client";
import { useState, useEffect } from "react";
import { Wallet, Shield, Calendar, LogOut, Pencil, Check, X, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { usePermissions } from "@/app/contexts/PermissionContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { useRouter } from "next/navigation";

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

export default function Profile() {
  const { connected, shortAddress, publicKey: address, disconnect } = useWallet();
  const { permissions, activities } = usePermissions();
  const { t } = useI18n();
  const navigate = useRouter();

  const [userName, setUserName] = useState(() => localStorage.getItem("kixa-username") || "KIXA User");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [selectedColor, setSelectedColor] = useState(() => {
    const saved = localStorage.getItem("kixa-avatar-color");
    return saved ? parseInt(saved) : 0;
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("kixa-username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("kixa-avatar-color", String(selectedColor));
  }, [selectedColor]);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const activePerms = permissions.filter((p) => p.status === "active");
  const revokedPerms = permissions.filter((p) => p.status === "revoked");

  const handleDisconnect = () => {
    disconnect();
    navigate.push("/");
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="animate-in hidden md:block">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("profile.subtitle")}</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card-elevated p-6 sm:p-8 animate-in-delay-1">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[selectedColor]} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105`}>
              <span className="text-2xl sm:text-3xl font-bold text-white">{initials}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${connected ? "bg-success" : "bg-muted-foreground"}`} />
          </div>

          {/* Name & Address */}
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className="text-lg sm:text-xl font-bold bg-transparent border-b-2 border-primary focus:outline-none px-1 py-0.5 max-w-[200px]"
                />
                <button onClick={handleSaveName} className="p-1.5 rounded-lg hover:bg-muted/50 text-success transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditingName(false); setNameInput(userName); }} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-lg sm:text-xl font-bold">{userName}</h2>
                <button onClick={() => { setNameInput(userName); setEditingName(true); }} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {connected ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                <span className="text-xs font-mono text-muted-foreground">{shortAddress}</span>
                <button onClick={handleCopyAddress} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">{t("overview.notConnected")}</p>
            )}

            {/* Avatar color picker */}
            <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
              {AVATAR_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} transition-all duration-200 ${
                    selectedColor === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-in-delay-2">
        {[
          { value: permissions.length, label: t("profile.totalPerms"), color: "text-primary" },
          { value: activePerms.length, label: t("overview.authorized"), color: "text-success" },
          { value: revokedPerms.length, label: t("perms.revoke"), color: "text-destructive" },
          { value: activities.length, label: t("overview.events"), color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card !p-4 sm:!p-5 text-center">
            <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="glass-card p-5 sm:p-6 space-y-3 animate-in-delay-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("profile.walletStatus")}</p>
            <p className="text-sm font-medium">{connected ? t("profile.connected") : t("profile.disconnected")}</p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-success" : "bg-muted-foreground"}`} />
        </div>

        {connected && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("general.solanaMainnet")}</p>
              <p className="text-sm font-medium font-mono">{shortAddress}</p>
            </div>
            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">{t("overview.viewExplorer")}</span>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("profile.totalPerms")}</p>
            <p className="text-sm font-medium">{permissions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("profile.accountCreated")}</p>
            <p className="text-sm font-medium">{t("profile.accountDate")}</p>
          </div>
        </div>
      </div>

      {/* Disconnect */}
      {connected && (
        <button
          onClick={handleDisconnect}
          className="inline-flex items-center gap-2 px-6 py-3 h-12 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-all active:scale-[0.97] touch-target animate-in-delay-3"
        >
          <LogOut className="w-4 h-4" />
          {t("profile.disconnect")}
        </button>
      )}
    </div>
  );
}
