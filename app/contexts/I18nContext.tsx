"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Locale = "en" | "pt" | "es";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.overview": "Overview",
    "nav.permissions": "Permissions",
    "nav.agent": "Agent",
    "nav.activity": "Activity",
    "nav.profile": "Profile",
    "nav.quickGuide": "Quick Guide",
    "overview.title": "Overview",
    "overview.welcome": "Welcome back",
    "overview.activePerms": "Active Permissions",
    "overview.totalCreated": "Total Created",
    "overview.events": "Events",
    "overview.permExpiresSingular": "permission expires soon",
    "overview.permExpiresPlural": "permissions expire soon",
    "overview.expiringSoon": "expiring soon",
    "overview.expiresIn": "Expires in",
    "overview.aiAuthorized": "AI Authorized",
    "overview.walletStatus": "Wallet Status",
    "overview.viewExplorer": "View Explorer",
    "overview.recentActivity": "Recent Activity",
    "overview.latestEvents": "Latest events",
    "overview.activityCreated": "Created",
    "overview.activityExpired": "Expired",
    "overview.activityRevoked": "Revoked",
    "overview.systemActive": "System Active",
    "overview.agentOperating": "Agent Operating",
    "overview.actionsToday": "actions today",
    "overview.agentVersion": "Agent Version",
    "overview.notConnected": "Not Connected",
    "overview.authorized": "Authorized",
    "overview.inactive": "Inactive",
    "overview.noActive": "No active permissions",
    "overview.noActivity": "No recent activity",
    "overview.grantPerms": "Grant Permissions",
    "overview.renew": "Renew",
    "overview.deactivate": "Deactivate",
    "overview.confirmDeactivate": "Confirm Deactivation",
    "overview.confirmDeactivateDesc": "Are you sure you want to deactivate",
    "overview.confirmDeactivateDescSuffix": "This will stop all agent operations.",
    "overview.cancelBtn": "Cancel",
    "overview.confirmBtn": "Confirm",
    "agent.title": "Agent",
    "agent.subtitle": "Configure your AI agent",
    "agent.status.active": "Active",
    "agent.status.paused": "Paused",
    "agent.status.inactive": "Inactive",
    "agent.status.authorized": "Authorized",
    "agent.status.restricted": "Restricted",
    "agent.pause": "Pause",
    "agent.resume": "Resume",
    "agent.testAgent": "Test Agent",
    "agent.capabilities": "Capabilities",
    "agent.capabilitiesDesc": "What this agent can do",
    "agent.securityLimits": "Security Limits",
    "agent.securityLimitsDesc": "Rules and boundaries",
    "agent.howToUse": "How To Use",
    "agent.howToUseDesc": "Integration guide",
    "agent.howToStep1": "Copy the system prompt",
    "agent.howToStep2": "Add to your agent configuration",
    "agent.until": "Until",
    "agent.spentToday": "Spent today",
    "agent.used": "used",
    "agent.remaining": "remaining",
    "agent.limitWarning": "Approaching limit",
    "agent.limitCaution": "Limit reached",
    "agent.noActivePerms": "No active permissions",
    "agent.activeSummary": "Active permissions summary",
    "agent.copy": "Copy",
    "agent.copied": "Copied!",
    "agent.prompt.noPerms": "No active permissions",
    "agent.prompt.header": "Active Permissions:",
    "agent.prompt.until": "until",
    "agent.prompt.footer": "Use within these limits.",
    "perms.title": "Permissions",
    "perms.subtitle": "Manage AI agent access rules",
    "perms.create": "Create",
    "perms.revoke": "Revoke",
    "filter.all": "All",
    "filter.active": "Active",
    "filter.expiring": "Expiring",
    "filter.expired": "Expired",
    "filter.revoked": "Revoked",
    "search.placeholder": "Search permissions...",
    "empty.noResults": "No results found",
    "empty.noPerms": "No permissions yet",
    "empty.noResultsDesc": "Try adjusting your search",
    "empty.noPermsDesc": "Create your first permission",
    "empty.createFirst": "Create First Permission",
    "card.token": "Token",
    "card.limit": "Limit",
    "card.expired": "Expired",
    "card.expires": "Expires in",
    "card.details": "Details",
    "card.renew": "Renew",
    "card.revoke": "Revoke",
    "card.agent": "Agent",
    "card.createdAt": "Created",
    "card.hide": "Hide",
    "status.active": "Active",
    "status.expiring": "Expiring",
    "status.expired": "Expired",
    "status.revoked": "Revoked",
    "ptype.spend": "Spend",
    "ptype.spendDesc": "Send SOL to addresses",
    "ptype.swap": "Swap",
    "ptype.swapDesc": "Exchange tokens",
    "ptype.mint": "Mint NFT",
    "ptype.mintDesc": "Create NFT",
    "ptype.transfer": "Transfer",
    "ptype.transferDesc": "Transfer tokens",
    "ptype.timeBased": "Time-based",
    "ptype.timeBasedDesc": "Scheduled actions",
    "ptype.whitelist": "Whitelist",
    "ptype.whitelistDesc": "Approved addresses",
    "ptype.custom": "Custom",
    "ptype.customDesc": "Custom rule",
    "stepper.step1": "Choose Permission Type",
    "stepper.step2": "Configure Rules",
    "stepper.step3": "Review & Confirm",
    "stepper.back": "Back",
    "stepper.next": "Next",
    "stepper.confirm": "Confirm",
    "stepper.successTitle": "Permission Created",
    "stepper.successDesc": "Your permission has been created successfully",
    "field.token": "Token",
    "field.limit": "Limit",
    "field.duration": "Duration",
    "field.agent": "Agent",
    "field.maxMint": "Max Mint",
    "field.approvedContracts": "Approved Contracts",
    "field.approvedPlaceholder": "Enter contract address",
    "field.maxPerInteraction": "Max Per Interaction",
    "field.maxPerTx": "Max Per Transaction",
    "field.maxSwaps": "Max Swaps",
    "field.maxValue": "Max Value",
    "field.ruleDesc": "Rule Description",
    "field.rulePlaceholder": "Select rule type",
    "field.sourceToken": "Source Token",
    "field.destToken": "Destination Token",
    "field.startTime": "Start Time",
    "field.endTime": "End Time",
    "field.customDays": "Custom Days",
    "dur.1day": "1 Day",
    "dur.7days": "7 Days",
    "dur.30days": "30 Days",
    "dur.custom": "Custom",
    "review.type": "Type",
    "review.limit": "Limit",
    "review.duration": "Duration",
    "review.days": "days",
    "review.agent": "Agent",
    "revoke.title": "Revoke Permission",
    "revoke.desc": "Are you sure you want to revoke",
    "revoke.descSuffix": "This action cannot be undone.",
    "revoke.cancel": "Cancel",
    "revoke.confirmBtn": "Revoke",
    "activity.title": "Activity",
    "activity.subtitle": "Track agent actions",
    "actPage.title": "Activity Log",
    "actPage.searchPlaceholder": "Search activity...",
    "actPage.emptyTitle": "No activity yet",
    "actPage.emptyDesc": "Agent actions will appear here",
    "actPage.wasCreated": "was created",
    "actPage.wasRevoked": "was revoked",
    "actPage.hasExpired": "has expired",
    "actPage.of": "of",
    "profile.title": "Profile",
    "profile.subtitle": "Manage your account",
    "profile.walletStatus": "Wallet Status",
    "profile.connected": "Connected",
    "profile.disconnected": "Disconnected",
    "profile.disconnect": "Disconnect",
    "profile.accountCreated": "Account Created",
    "profile.accountDate": "Account Date",
    "profile.totalPerms": "Total Permissions",
    "onboarding.start": "Start",
    "onboarding.next": "Next",
    "onboarding.back": "Back",
    "onboarding.skip": "Skip",
    "general.solanaMainnet": "Solana Mainnet",
    "activity.created": "Created",
    "activity.revoked": "Revoked",
    "activity.expired": "Expired",
    "activity.renewed": "Renewed",
    "activity.executed": "Executed", 
  },
  pt: {},
  es: {}
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kixa-locale");
      if (saved && ["en", "pt", "es"].includes(saved)) {
        setLocaleState(saved as Locale);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("kixa-locale", newLocale);
    }
  }, []);

  const t = useCallback((key: string) => {
    return translations[locale]?.[key] || key;
  }, [locale]);

  if (!mounted) return <>{children}</>;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  return useContext(I18nContext);
};
