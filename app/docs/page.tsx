"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Bot, Cpu, Clock, Zap, Map, Eye, Globe, Sun, Moon, Brain, Sparkles, ChevronDown } from "lucide-react";

const sectionIds = ["what","how","quickperm","agentbuilder","types","security","activity","solana","roadmap","vision"];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DocsPage() {
  const [dark, setDark] = useState(false);
  const [locale, setLocale] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("kixa-theme");
    const savedLocale = localStorage.getItem("kixa-locale");
    const d = savedTheme === "dark";
    setDark(d);
    setIsDark(d);
    document.documentElement.classList.toggle("dark", d);
    if (savedLocale && ["pt","en","es"].includes(savedLocale)) setLocale(savedLocale);
  }, []);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("kixa-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const changeLang = (l: string) => {
    setLocale(l);
    localStorage.setItem("kixa-locale", l);
    setLangOpen(false);
  };

  const langs = [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
  ];

  const sections = [
    { id: "what", icon: Shield, label: "What is KIXA?" },
    { id: "how", icon: Zap, label: "How It Works" },
    { id: "quickperm", icon: Shield, label: "Quick Permission" },
    { id: "agentbuilder", icon: Brain, label: "AI Agent Builder" },
    { id: "types", icon: Lock, label: "Permission Types" },
    { id: "security", icon: Lock, label: "Security Model" },
    { id: "activity", icon: Clock, label: "Activity Tracking" },
    { id: "solana", icon: Zap, label: "Why Solana?" },
    { id: "roadmap", icon: Map, label: "Roadmap" },
    { id: "vision", icon: Eye, label: "The Vision" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">

      {/* Header */}
      <header className="sticky top-0 z-50 h-16 px-6 sm:px-10 flex items-center justify-between border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <img
            src={isDark ? "/kixa-logo-dark.svg" : "/kixa-logo-light.svg"}
            alt="KIXA" className="h-9 sm:h-11 w-auto"
          />
          <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Documentation</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-16 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "pulse-soft 2s ease-in-out infinite" }} />
            <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Complete Guide</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: "'Archivo Black',sans-serif" }}>
            Everything about <span className="text-primary">KIXA</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            Learn how KIXA works, understand the two ways to use it, and discover why on-chain permissions for AI agents matter.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass-card rounded-2xl p-8 mb-16 animate-in-delay-1">
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map(({ id, icon: Icon, label }, i) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-left group">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-16">

          <Section id="what" icon={Shield} title="What is KIXA?">
            <p>KIXA is an on-chain permission protocol for AI agents on Solana. It lets you define exactly what an agent can do before it takes any action.</p>
            <p className="mt-3">How much it can spend, where it can send, for how long. Every rule is written on-chain and enforced by the smart contract. No trust required.</p>
            <p className="mt-3">KIXA supports two workflows: granting permissions to existing agents (Quick Permission) and creating new agents from scratch with AI (Agent Builder).</p>
          </Section>

          <Section id="how" icon={Zap} title="How It Works">
            <p>KIXA works in three simple steps:</p>
            <div className="mt-4 space-y-3">
              {[
                { n: "1", title: "Connect", desc: "Connect your Solana wallet (Phantom, Solflare or any compatible)." },
                { n: "2", title: "Set Rules", desc: "Define spend limits, token types, recipient locks and expiration dates." },
                { n: "3", title: "Deploy", desc: "Rules are written on-chain via a transaction. The agent can only act within your boundaries." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="quickperm" icon={Shield} title="Quick Permission">
            <p>Quick Permission is for users who already have an AI agent running and need to grant it on-chain permissions.</p>
            <div className="mt-4 space-y-2">
              {[
                "Connect your wallet",
                "Select an existing agent by address",
                "Choose permission type (spend, mint, transfer, etc.)",
                "Set limits, recipient and expiration",
                "Sign the transaction — permissions are live",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">The entire process takes less than 30 seconds. No code needed.</p>
          </Section>

          <Section id="agentbuilder" icon={Brain} title="AI Agent Builder">
            <p>The AI Agent Builder lets you create a fully configured agent just by describing what you want it to do.</p>
            <div className="mt-4 glass-card rounded-2xl p-6 space-y-4">
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm max-w-[300px]">
                  I want a DCA bot that buys 10 SOL worth of ETH every week, max 50 SOL total.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm">
                  Got it! I'll create your DCA agent with: Spend Limit (50 SOL), Frequency (weekly), Auto-Expiration (90 days).
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">The AI infers the right permissions from your description, shows them for review, and deploys everything on-chain once you confirm.</p>
          </Section>

          <Section id="types" icon={Lock} title="Permission Types">
            <div className="space-y-2">
              {[
                { type: "Spend Limit", desc: "Cap how much SOL/tokens the agent can spend total or per transaction." },
                { type: "Mint NFT", desc: "Allow the agent to mint NFTs up to a specific value." },
                { type: "Transfer", desc: "Restrict transfers to specific recipient wallet addresses." },
                { type: "Token Swap", desc: "Allow the agent to perform token swaps within defined limits." },
                { type: "Time-based", desc: "Restrict agent actions to specific time windows." },
                { type: "Whitelist", desc: "Only allow interactions with pre-approved smart contracts." },
                { type: "Custom", desc: "Define your own rules freely for specific use cases." },
              ].map(({ type, desc }) => (
                <div key={type} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-sm font-bold text-primary min-w-[100px] shrink-0">{type}</span>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="security" icon={Lock} title="Security Model">
            <p>Every permission in KIXA is a PDA (Program Derived Address) account on the Anchor smart contract.</p>
            <p className="mt-3">Before executing any action, the agent must present its permission to the contract. The contract checks four things:</p>
            <div className="mt-4 space-y-2">
              {[
                "Is the wallet authorized?",
                "Is the spend limit exceeded?",
                "Is the recipient allowed?",
                "Is the permission still valid (not expired)?",
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{check}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">If any check fails, the action is blocked. No exceptions, no overrides.</p>
          </Section>

          <Section id="activity" icon={Clock} title="Activity Tracking">
            <p>Every agent action is logged on-chain with a timestamp. The KIXA dashboard shows the complete history:</p>
            <div className="mt-4 space-y-2">
              {[
                { label: "Permission created", color: "bg-green-500" },
                { label: "Agent executed action", color: "bg-primary" },
                { label: "Permission revoked", color: "bg-red-500" },
                { label: "Permission auto-expired", color: "bg-muted-foreground" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Full transparency. You always know what your agent did and when.</p>
          </Section>

          <Section id="solana" icon={Zap} title="Why Solana?">
            <p>KIXA is built on Solana for three reasons:</p>
            <div className="mt-4 space-y-3">
              {[
                { title: "Speed", desc: "Transactions confirm in under 400ms. Permission checks happen in real-time." },
                { title: "Cost", desc: "Fees below $0.001 per transaction. Creating and checking permissions is essentially free." },
                { title: "Ecosystem", desc: "Solana has the largest ecosystem of AI agents, DeFi protocols and NFT platforms." },
              ].map(({ title, desc }) => (
                <div key={title} className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="roadmap" icon={Map} title="Roadmap">
            <div className="space-y-3">
              {[
                { phase: "Phase 1", status: "✅", desc: "Anchor smart contract + Dashboard + AI Agent Builder" },
                { phase: "Phase 2", status: "🔄", desc: "Mainnet deploy + AI agent integrations + API" },
                { phase: "Phase 3", status: "📋", desc: "Multi-agent support + Shuriken tier system + Public API" },
                { phase: "Phase 4", status: "🔮", desc: "Permission marketplace + SDK + Cross-chain" },
              ].map(({ phase, status, desc }) => (
                <div key={phase} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-lg">{status}</span>
                  <div>
                    <p className="text-sm font-bold text-primary">{phase}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="vision" icon={Eye} title="The Vision">
            <p>As AI agents gain access to wallets, contracts and real money, the lack of verifiable permissions is the single biggest risk in the ecosystem.</p>
            <p className="mt-3">KIXA solves this. What an agent can do is written on the blockchain — not on trust, not on hope. On-chain, verifiable, revocable.</p>
            <p className="mt-3">The future of AI is autonomous. The future of safe AI is permissioned. KIXA makes that possible.</p>
          </Section>

        </div>

        {/* Back to top */}
        <div className="mt-20 text-center">
          <button onClick={() => { document.documentElement.scrollTo({ top: 0, behavior: "smooth" }); document.body.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all">
            Back to top
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 80 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif" }}>{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
