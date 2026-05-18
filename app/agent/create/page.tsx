"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/contexts/WalletContext";
import { Send, Sparkles, Loader2, Bot, Shield, ArrowLeft, Check } from "lucide-react";

const TEMPLATES = [
  { icon: "📉", name: "DCA Bot", description: "Automatically buy a token at regular intervals.", prompt: "I want a DCA bot that buys 10 SOL worth of ETH every week, with a maximum of 50 SOL total spend." },
  { icon: "📈", name: "Trading Bot", description: "Buy and sell based on price conditions.", prompt: "I want a trading bot that swaps SOL to USDC when price drops 10%, never spending more than 20 SOL per transaction." },
  { icon: "⚖️", name: "Rebalancer", description: "Keep your portfolio at defined percentages automatically.", prompt: "I want a rebalancer agent that keeps my portfolio at 50% SOL and 50% USDC, rebalancing every 24 hours." },
  { icon: "💸", name: "Recurring Payment", description: "Automatic recurring payments to a specific wallet.", prompt: "I want an agent that sends 2 SOL every month to a specific wallet address, only to that wallet." },
  { icon: "⚡", name: "Arbitrage Bot", description: "Exploit price differences between DEXs.", prompt: "I want an arbitrage bot that finds and exploits price differences between Solana DEXs, with a max spend of 10 SOL per trade." },
];

export default function AgentCreatePage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Hi! I'll help you create your AI agent. What would you like your agent to do?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
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
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong: " + data.error }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        if (data.agentConfig) setAgentConfig(data.agentConfig);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
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
      setMessages(prev => [...prev, { role: "assistant", content: "Your agent has been deployed successfully! You can view it in the Agents page." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to deploy: " + String(err) }]);
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
      <p className="text-muted-foreground">Connect your wallet</p>
      <button onClick={() => router.push("/")} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Go Home</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Choose a Template</h2>
              <button onClick={() => setShowTemplates(false)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => handleTemplate(t.prompt)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </div>
                </button>
              ))}
              <button onClick={() => setShowTemplates(false)}
                className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">Custom</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Describe your own agent with AI.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/agents")} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="hidden md:block text-2xl font-semibold tracking-tight">Create AI Agent</h1>
          <p className="text-sm text-muted-foreground">Describe what you want your agent to do.</p>
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
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-border/50 space-y-2">
            <button onClick={() => setShowTemplates(true)}
              className="w-full py-2 rounded-xl border border-border/50 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
              Or start from a template →
            </button>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Describe your agent..."
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent Preview</h3>
            </div>
            {agentConfig ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{agentConfig.agent_name}</p>
                <p className="text-xs text-muted-foreground">{agentConfig.agent_description}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{agentConfig.agent_type}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Config will appear as you chat...</p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissions</h3>
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
              <p className="text-sm text-muted-foreground italic">Rules will be defined by AI...</p>
            )}
          </div>

          {deployed ? (
            <button onClick={() => router.push("/agents")} className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors">
              View Agents
            </button>
          ) : (
            <button onClick={handleDeploy} disabled={!agentConfig || deploying} className={"w-full py-3 rounded-xl font-semibold text-sm transition-colors " + (agentConfig ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              {deploying ? "Deploying..." : "Create Agent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
