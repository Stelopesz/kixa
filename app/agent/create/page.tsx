"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/contexts/WalletContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { Send, Sparkles, Loader2, Bot, Shield, ArrowLeft, Check, TrendingDown, TrendingUp, Scale, Repeat, Zap, Pencil } from "lucide-react";

const TEMPLATE_PROMPTS = [
  { icon: TrendingDown, promptKey: "dca", prompt: "I want a DCA bot that buys 10 SOL worth of ETH every week, with a maximum of 50 SOL total spend." },
  { icon: TrendingUp, promptKey: "trading", prompt: "I want a trading bot that swaps SOL to USDC when price drops 10%, never spending more than 20 SOL per transaction." },
  { icon: Scale, promptKey: "rebalancer", prompt: "I want a rebalancer agent that keeps my portfolio at 50% SOL and 50% USDC, rebalancing every 24 hours." },
  { icon: Repeat, promptKey: "recurring", prompt: "I want an agent that sends 2 SOL every month to a specific wallet address, only to that wallet." },
  { icon: Zap, promptKey: "arbitrage", prompt: "I want an arbitrage bot that finds and exploits price differences between Solana DEXs, with a max spend of 10 SOL per trade." },
];

const TEMPLATE_NAMES: Record<string, Record<string, { name: string; description: string }>> = {
  dca: {
    en: { name: "DCA Bot", description: "Automatically buy a token at regular intervals." },
    pt: { name: "DCA Bot", description: "Compre tokens automaticamente em intervalos regulares." },
    es: { name: "DCA Bot", description: "Compra tokens automáticamente a intervalos regulares." },
  },
  trading: {
    en: { name: "Trading Bot", description: "Buy and sell based on price conditions." },
    pt: { name: "Trading Bot", description: "Compre e venda com base em condições de preço." },
    es: { name: "Trading Bot", description: "Compra y vende según condiciones de precio." },
  },
  rebalancer: {
    en: { name: "Rebalancer", description: "Keep your portfolio at defined percentages automatically." },
    pt: { name: "Rebalanceador", description: "Mantenha seu portfólio em percentuais definidos automaticamente." },
    es: { name: "Rebalanceador", description: "Mantén tu portfolio en porcentajes definidos automáticamente." },
  },
  recurring: {
    en: { name: "Recurring Payment", description: "Automatic recurring payments to a specific wallet." },
    pt: { name: "Pagamento Recorrente", description: "Pagamentos recorrentes automáticos para uma carteira específica." },
    es: { name: "Pago Recurrente", description: "Pagos recurrentes automáticos a una billetera específica." },
  },
  arbitrage: {
    en: { name: "Arbitrage Bot", description: "Exploit price differences between DEXs." },
    pt: { name: "Arbitragem Bot", description: "Explore diferenças de preço entre DEXs." },
    es: { name: "Arbitrage Bot", description: "Explota diferencias de precio entre DEXs." },
  },
};

export default function AgentCreatePage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { t, locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setMessages([{ role: "assistant", content: t("agentCreate.greeting") }]);
  }, [locale]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages as any);
    setInput("");
    setLoading(true);
    try {
      const apiMessages = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/agent-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: t("agentCreate.errorMsg") + data.error }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        if (data.agentConfig) setAgentConfig(data.agentConfig);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t("agentCreate.connectionError") }]);
    }
    setLoading(false);
  };

  const handleTemplate = (prompt: string) => {
    setInput(prompt);
    setShowTemplates(false);
  };

  const handleDeploy = async () => {
    if (!agentConfig || deploying) return;
    setDeploying(true);
    try {
      const agentRes = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey || "",
          name: agentConfig.agent_name,
          description: agentConfig.agent_description,
          agent_type: agentConfig.agent_type,
          config: {},
        }),
      });
      const agent = await agentRes.json();
      if (agent.error) throw new Error(agent.error);
      for (const perm of agentConfig.permissions) {
        const exp = new Date();
        exp.setDate(exp.getDate() + (perm.expiration_days || 30));
        await fetch("/api/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: publicKey || "",
            agent_id: agent.id,
            type: perm.type,
            name: perm.name,
            description: perm.description,
            token: perm.token,
            limit: perm.limit,
            config: perm.config,
            expiration: exp.toISOString(),
          }),
        });
      }
      setDeployed(true);
      setMessages(prev => [...prev, { role: "assistant", content: t("agentCreate.deployedMsg") }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: t("agentCreate.deployError") + String(err) }]);
    }
    setDeploying(false);
  };

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );

  if (!connected) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-muted-foreground">{t("agentCreate.connectWallet")}</p>
      <button onClick={() => router.push("/")} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">{t("nav.goHome")}</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">

      {/* Templates Modal */}
      {showTemplates && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowTemplates(false)} />
          <div className="relative glass-card-elevated w-full max-w-lg p-5 sm:p-6 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{t("agentCreate.chooseTemplate")}</h2>
              <button onClick={() => setShowTemplates(false)} className="p-2 rounded-xl hover:bg-muted transition-colors flex items-center justify-center w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_PROMPTS.map((tmpl) => {
                const Icon = tmpl.icon;
                const info = TEMPLATE_NAMES[tmpl.promptKey][locale] || TEMPLATE_NAMES[tmpl.promptKey].en;
                return (
                  <button key={tmpl.promptKey} onClick={() => handleTemplate(tmpl.prompt)}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-border/50 bg-muted/30 text-left transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">{info.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{info.description}</p>
                  </button>
                );
              })}
              <button onClick={() => setShowTemplates(false)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-border/50 bg-muted/30 text-left transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Pencil className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold">{t("agentCreate.templateCustom")}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t("agentCreate.templateCustomDesc")}</p>
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/agents")} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="hidden md:block text-2xl font-semibold tracking-tight">{t("agentCreate.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("agentCreate.subtitle")}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Chat */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed max-w-[80%] ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <span className="text-sm text-muted-foreground">{t("agentCreate.thinking")}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-border/50 space-y-2">
            <button onClick={() => setShowTemplates(true)}
              className="w-full py-2 rounded-xl border border-primary/40 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-all">
              {t("agentCreate.startTemplate")}
            </button>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={t("agentCreate.placeholder")}
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button onClick={handleSend} disabled={loading} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 lg:w-64">
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("agentCreate.agentPreview")}</h3>
            </div>
            {agentConfig ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{agentConfig.agent_name}</p>
                <p className="text-xs text-muted-foreground">{agentConfig.agent_description}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{agentConfig.agent_type}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t("agentCreate.configPlaceholder")}</p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("perms.title")}</h3>
            </div>
            {agentConfig ? (
              <div className="space-y-2">
                {agentConfig.permissions.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.limit} {p.token} · {p.expiration_days}d</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t("agentCreate.permsPlaceholder")}</p>
            )}
          </div>

          {deployed ? (
            <button onClick={() => router.push("/agents")} className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors">
              {t("agentCreate.viewAgents")}
            </button>
          ) : (
            <button onClick={handleDeploy} disabled={!agentConfig || deploying} className={"w-full py-3 rounded-xl font-semibold text-sm transition-colors " + (agentConfig ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              {deploying ? t("agentCreate.deploying") : t("agents.create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
