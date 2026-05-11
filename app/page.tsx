"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@/app/contexts/WalletContext";
import { I18nProvider } from "@/app/contexts/I18nContext";
import WalletModal from "@/app/components/WalletModal";
import { Shield, Bot, Zap, Lock, Clock, ArrowRight, Sun, Moon, Globe, Check, Sparkles, ChevronDown } from "lucide-react";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { setVis(e.isIntersecting); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis] as const;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useDark() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("kixa-theme");
    const d = saved === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    setReady(true);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("kixa-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };
  return { dark, toggle, ready };
}

/* ── Floating shapes ── */
function FloatingShapes({ scrollY, dark }: { scrollY: number; dark: boolean }) {
  const c1 = dark ? "rgba(183,78,111,0.12)" : "rgba(183,78,111,0.08)";
  const c2 = dark ? "rgba(111,78,183,0.08)" : "rgba(183,120,78,0.06)";
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "5%", right: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${c1} 0%, transparent 70%)`,
        transform: `translateY(${scrollY * 0.15}px)`,
        transition: "background 0.5s",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "5%",
        width: 250, height: 250, borderRadius: "50%",
        background: `radial-gradient(circle, ${c2} 0%, transparent 70%)`,
        transform: `translateY(${-scrollY * 0.1}px)`,
        transition: "background 0.5s",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "20%",
        width: 200, height: 200, borderRadius: "50%",
        background: `radial-gradient(circle, ${c1} 0%, transparent 70%)`,
        transform: `translateY(${-scrollY * 0.08}px)`,
        transition: "background 0.5s",
      }} />
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onConnect, dark, toggleDark }: { onConnect: () => void; dark: boolean; toggleDark: () => void }) {
  const scrollY = useScrollY();
  const scrolled = scrollY > 30;
  const [isDark, setIsDark] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const langs = [{ code: "en", label: "English" }, { code: "pt", label: "Português" }, { code: "es", label: "Español" }];

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2.5" : "py-4"}`}
      style={{
        background: scrolled
          ? isDark ? "rgba(12,10,16,0.95)" : "rgba(255,238,238,0.95)"
          : isDark ? "rgba(12,10,16,0.8)" : "rgba(255,238,238,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid hsl(var(--border) / 0.5)" : "none",
      }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img
          src={isDark ? "/kixa-logo-dark.svg" : "/kixa-logo-light.svg"}
          alt="KIXA" className="h-9 sm:h-11 w-auto"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={toggleDark}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{langs.find(l => l.code === lang)?.label}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden z-50">
                {langs.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${lang === l.code ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onConnect}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97] ml-2">
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onConnect, scrollY, dark }: { onConnect: () => void; scrollY: number; dark: boolean }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 150); }, []);

  return (
    <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "90px 28px 50px" }}>
        <div className="flex flex-col items-center text-center md:grid md:grid-cols-2 md:text-left md:items-center" style={{ gap: 40 }}>

          {/* Shurikens */}
          <div className={`relative flex items-center justify-center mb-8 md:mb-0 transition-all duration-1000 ${vis ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            style={{ height: "clamp(140px, 26vw, 350px)" }}>
            <img src="/shuriken-large.png" alt="KIXA Shuriken" style={{
              width: "clamp(180px, 28vw, 360px)", position: "relative", zIndex: 2,
              filter: "drop-shadow(0 0 60px rgba(183,78,111,0.35))",
              transform: `translateY(${-scrollY * 0.08}px) rotate(${scrollY * 0.02}deg)`,
              animation: "float 4s ease-in-out infinite",
            }} />
            <img src="/shuriken-small.png" alt="" style={{
              width: "clamp(70px, 10vw, 150px)", position: "absolute", bottom: "-15%", right: "5%", zIndex: 3,
              filter: "drop-shadow(0 0 30px rgba(183,78,111,0.3))",
              transform: `translateY(${-scrollY * 0.12}px) rotate(${-scrollY * 0.04}deg)`,
              animation: "float 5s ease-in-out infinite 1s",
            }} />
            <div style={{
              position: "absolute", width: "60%", height: "60%", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(183,78,111,0.2) 0%, transparent 70%)",
              filter: "blur(40px)", zIndex: 1,
            }} />
          </div>

          {/* Text */}
          <div>
            <div className={`transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] mb-6 sm:mb-8"
                style={{ backdropFilter: "blur(8px)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "pulse-soft 2s ease-in-out infinite" }} />
                <span className="text-[10px] sm:text-[11px] font-bold text-primary tracking-widest uppercase">On-chain Permission Protocol</span>
              </div>
            </div>

            <h1 className={`transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,6vw,76px)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20, transitionDelay: "0.1s" }}>
              Your agent,<br /><span className="text-primary">your rules.</span>
            </h1>

            <p className={`text-muted-foreground mx-auto md:mx-0 mb-8 sm:mb-10 leading-relaxed transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ fontSize: "clamp(14px,1.6vw,18px)", maxWidth: 300, transitionDelay: "0.2s" }}>
              Create AI agents and define their on-chain permissions without code, with immutable rules on the blockchain.
            </p>

            <div className={`flex gap-3 flex-row justify-center md:justify-start transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.35s" }}>
              <button onClick={onConnect}
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <a href="/docs"
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl border border-border/40 text-foreground/60 text-sm sm:text-base font-semibold hover:bg-muted/30 hover:text-foreground transition-all"
                style={{ textDecoration: "none" }}>
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 ${vis ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "0.6s" }}>
        <ChevronDown className="w-5 h-5 text-muted-foreground/30" style={{ animation: "float 2.5s ease-in-out infinite" }} />
      </div>
    </section>
  );
}

/* ── Live Demo ── */
function LiveDemo() {
  const [ref, vis] = useReveal();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!vis) return;
    const t = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => setStep(4), 5000),
    ];
    return () => t.forEach(clearTimeout);
  }, [vis]);

  return (
    <section id="demo" ref={ref} className="py-32 px-6" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">See it in action</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          From idea to agent<br />in seconds.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[420px] mx-auto leading-relaxed">
          Just type what you want. AI creates the agent and sets permissions for you.
        </p>
      </div>

      <div className={`glass-card-elevated rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "0.15s" }}>
        <div className="flex items-center gap-2 px-6 py-3.5 border-b border-border/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
            <div className="w-3 h-3 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-muted-foreground/60 font-mono">kixa.cc/agent/create</span>
          </div>
        </div>

        <div className="p-8 space-y-5" style={{ minHeight: 360 }}>
          {/* User msg */}
          <div className={`flex justify-end transition-all duration-600 ${step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="px-5 py-3.5 rounded-2xl rounded-tr-md bg-primary text-primary-foreground text-sm max-w-[340px] leading-relaxed">
              I want a DCA bot that buys 10 SOL worth of ETH every week, max 50 SOL total.
            </div>
          </div>

          {/* AI response */}
          <div className={`flex gap-3 items-start transition-all duration-600 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-md bg-muted/40 text-sm max-w-[360px] leading-relaxed">
              Got it! Here are the permissions for your DCA agent:
            </div>
          </div>

          {/* Permission cards */}
          <div className={`flex gap-3 items-start transition-all duration-600 ${step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 shrink-0" />
            <div className="space-y-2.5 flex-1 max-w-[360px]">
              {[
                { icon: Lock, label: "Spend Limit", value: "50 SOL max" },
                { icon: Clock, label: "Frequency", value: "Every 7 days" },
                { icon: Shield, label: "Auto-Expiration", value: "90 days" },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl glass-surface"
                  style={{ animation: step >= 3 ? `fade-up 0.4s ease-out ${i * 0.12}s forwards` : "none", opacity: step >= 3 ? undefined : 0 }}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{value}</p>
                  </div>
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Deployed */}
          <div className={`flex gap-3 items-start transition-all duration-600 ${step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-md border border-green-500/20 bg-green-500/5 text-sm max-w-[360px]">
              <p className="font-bold text-green-600 dark:text-green-400">Agent deployed on-chain!</p>
              <p className="text-muted-foreground text-xs mt-1">DCA Bot is live. First run in 7 days.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Two Ways ── */
function TwoWays({ onConnect }: { onConnect: () => void }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="py-32 px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Two ways to use KIXA</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          Pick your path.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[440px] mx-auto leading-relaxed">
          Already have an agent or starting fresh — KIXA works either way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: Shield, delay: 0, tag: "For existing agents", title: "Quick Permission",
            desc: "Grant permissions to any AI agent in seconds. Set limits and rules — the agent starts instantly.",
            steps: ["Connect your wallet", "Choose an existing agent", "Set spend limits and rules", "Agent is live instantly"],
            cta: "Grant Permission",
          },
          {
            icon: Bot, delay: 0.12, tag: "Build from scratch", title: "AI Agent Builder",
            desc: "Tell our AI what you want. It figures out the permissions and deploys everything on-chain.",
            steps: ["Describe your goal in plain text", "AI infers the right permissions", "Review and confirm the rules", "Agent deployed on-chain"],
            cta: "Build an Agent",
          },
        ].map(({ icon: Icon, delay, tag, title, desc, steps, cta }) => (
          <div key={title}
            className={`glass-card rounded-3xl p-9 flex flex-col gap-8 transition-all duration-500 hover:border-primary/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] ${
              vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: `${delay}s` }}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-6">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{tag}</span>
              <h3 className="text-2xl font-black mt-2 mb-3 tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif" }}>{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <button onClick={onConnect}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 mt-auto">
              {cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features ── */
function Features() {
  const [ref, vis] = useReveal();
  const features = [
    { icon: Lock, title: "Spend Limits", desc: "Cap how much SOL your agent can move. Never more than you allow." },
    { icon: Clock, title: "Auto-Expiration", desc: "Permissions expire automatically. Set it and forget it." },
    { icon: Shield, title: "Recipient Lock", desc: "Restrict to specific wallet addresses only." },
    { icon: Zap, title: "Session Keys", desc: "Rules enforced on-chain via session keys." },
  ];

  return (
    <section ref={ref} className="py-32 px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Security by default</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          Built to keep your<br />wallet safe.
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={title}
            className={`glass-card rounded-2xl p-7 transition-all duration-500 hover:border-primary/30 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.03] ${
              vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/12 flex items-center justify-center mb-5">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-[15px] font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA({ onConnect }: { onConnect: () => void }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="py-32 px-6 text-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(183,78,111,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className={`max-w-[580px] mx-auto relative transition-all duration-900 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <h2 className="font-black tracking-tight mb-6" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(36px,6vw,66px)", lineHeight: 1 }}>
          Your agent.<br /><span className="text-primary">Your rules.</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-[420px] mx-auto">
          Start in under 30 seconds. Connect, set your rules and go.
        </p>
        <button onClick={onConnect}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
          Get Started Now <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-5 text-xs text-muted-foreground/40">No signup. No fees. Just connect and go.</p>
      </div>
    </section>
  );
}

/* ── Page ── */
function KixaLPInner() {
  const router = useRouter();
  const { connected } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const { dark, toggle } = useDark();
  const scrollY = useScrollY();

  useEffect(() => { if (connected) router.push("/dashboard"); }, [connected, router]);

  const onConnect = () => setShowModal(true);

  return (
    <>
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Video background — covers entire page */}
      <video
        key={dark ? "dark" : "light"}
        autoPlay muted loop playsInline
        style={{
          position: "fixed", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", zIndex: -2, opacity: dark ? 0.35 : 0.5,
        }}
      >
        <source src={dark ? "/shuriken-bg-dark.mp4" : "/shuriken-bg.mp4"} type="video/mp4" />
      </video>

      {/* Vignette — fades video on edges */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
        background: dark
          ? "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(12,10,16,0.7) 100%)"
          : "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(255,238,238,0.75) 100%)",
      }} />

      {/* BG color behind video */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -3, transition: "background 0.5s ease",
        background: dark ? "#0c0a10" : "#ffeeee",
      }} />



      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar onConnect={onConnect} dark={dark} toggleDark={toggle} />
        <Hero onConnect={onConnect} scrollY={scrollY} dark={dark} />
        <LiveDemo />
        <TwoWays onConnect={onConnect} />
        <Features />
        <FinalCTA onConnect={onConnect} />
      </div>
    </>
  );
}

export default function KixaLP() {
  return <WalletProvider><I18nProvider><KixaLPInner /></I18nProvider></WalletProvider>;
}
