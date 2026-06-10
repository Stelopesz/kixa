"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletModal from "@/app/components/WalletModal";
import { Shield, Bot, Zap, Lock, Clock, ArrowRight, Sun, Moon, Check, Sparkles, ChevronDown } from "lucide-react";
import LanguageDropdown from "@/app/components/LanguageDropdown";
import { useI18n } from "@/app/contexts/I18nContext";

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
  const { t } = useI18n();
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

      {/* Footer */}

      <footer style={{borderTop:"1px solid hsl(var(--border))",padding:"24px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src="/kixa-logo-light.svg" alt="KIXA" style={{height:24}} className="dark:hidden" />
          <img src="/kixa-logo-dark.svg" alt="KIXA" style={{height:24,display:"none"}} className="dark:block" />
          <span style={{fontSize:12,color:"hsl(var(--muted-foreground))"}}>{t("lp.footer.rights")}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <a href="https://x.com/usekixa" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"hsl(var(--muted-foreground))",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#b74e6f"} onMouseLeave={e=>e.currentTarget.style.color="hsl(var(--muted-foreground))"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            @usekixa
          </a>
          <a href="https://github.com/Stelopesz/kixa" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"hsl(var(--muted-foreground))",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#b74e6f"} onMouseLeave={e=>e.currentTarget.style.color="hsl(var(--muted-foreground))"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onConnect, dark, toggleDark }: { onConnect: () => void; dark: boolean; toggleDark: () => void }) {
  const { t } = useI18n();
  const scrollY = useScrollY();
  const scrolled = scrollY > 30;
  const [isDark, setIsDark] = useState(false);

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
          <LanguageDropdown />
          <a href="/docs" className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            {t("lp.nav.docs")}
          </a>
          <button onClick={onConnect}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97] ml-2">
            {t("lp.nav.connect")}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onConnect, scrollY, dark }: { onConnect: () => void; scrollY: number; dark: boolean }) {
  const { t } = useI18n();
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
                <span className="text-[10px] sm:text-[11px] font-bold text-primary tracking-widest uppercase">{t("lp.hero.badge")}</span>
              </div>
            </div>

            <h1 className={`transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,6vw,76px)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20, transitionDelay: "0.1s" }}>
              {t("lp.hero.title1")}<br /><span className="text-primary">{t("lp.hero.title2")}</span>
            </h1>

            <p className={`text-muted-foreground mx-auto md:mx-0 mb-8 sm:mb-10 leading-relaxed transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ fontSize: "clamp(14px,1.6vw,18px)", maxWidth: 300, transitionDelay: "0.2s" }}>
              {t("lp.hero.desc")}
            </p>

            <div className={`flex gap-3 flex-row justify-center md:justify-start transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.35s" }}>
              <button onClick={onConnect}
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                {t("lp.hero.cta1")} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <a href="/docs"
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl border border-border/40 text-foreground/60 text-sm sm:text-base font-semibold hover:bg-muted/30 hover:text-foreground transition-all"
                style={{ textDecoration: "none" }}>
                {t("lp.hero.cta2")}
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
  const { t } = useI18n();
  const [ref, vis] = useReveal();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!vis) return;
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2300),
      setTimeout(() => setStep(4), 3300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [vis]);

  const demoCards = [
    { icon: Lock, label: t("lp.demo.spendLimit"), value: t("lp.demo.spendLimitVal") },
    { icon: Clock, label: t("lp.demo.frequency"), value: t("lp.demo.frequencyVal") },
    { icon: Shield, label: t("lp.demo.autoExpiry"), value: t("lp.demo.autoExpiryVal") },
  ];

  return (
    <section id="demo" ref={ref} className="py-32 px-6" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{t("lp.demo.badge")}</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          {t("lp.demo.title1")}<br />{t("lp.demo.title2")}
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[420px] mx-auto leading-relaxed">
          {t("lp.demo.desc")}
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
              {t("lp.demo.msg")}
            </div>
          </div>

          {/* AI response */}
          <div className={`flex gap-3 items-start transition-all duration-600 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-md bg-muted/40 text-sm max-w-[360px] leading-relaxed">
              {t("lp.demo.aiReply")}
            </div>
          </div>

          {/* Permission cards */}
          <div className={`flex gap-3 items-start transition-all duration-600 ${step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 shrink-0" />
            <div className="space-y-2.5 flex-1 max-w-[360px]">
              {demoCards.map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl glass-surface"
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
              <p className="font-bold text-green-600 dark:text-green-400">{t("lp.demo.deployed")}</p>
              <p className="text-muted-foreground text-xs mt-1">{t("lp.demo.deployedDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Two Ways ── */
function TwoWays({ onConnect }: { onConnect: () => void }) {
  const { t } = useI18n();
  const [ref, vis] = useReveal();

  const cards = [
    {
      icon: Shield, delay: 0,
      tag: t("lp.ways.qp.tag"), title: t("lp.ways.qp.title"),
      desc: t("lp.ways.qp.desc"),
      steps: [t("lp.ways.qp.s1"), t("lp.ways.qp.s2"), t("lp.ways.qp.s3"), t("lp.ways.qp.s4")],
      cta: t("lp.ways.qp.cta"),
    },
    {
      icon: Bot, delay: 0.12,
      tag: t("lp.ways.ai.tag"), title: t("lp.ways.ai.title"),
      desc: t("lp.ways.ai.desc"),
      steps: [t("lp.ways.ai.s1"), t("lp.ways.ai.s2"), t("lp.ways.ai.s3"), t("lp.ways.ai.s4")],
      cta: t("lp.ways.ai.cta"),
    },
  ];

  return (
    <section ref={ref} className="py-32 px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{t("lp.ways.badge")}</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          {t("lp.ways.title")}
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[440px] mx-auto leading-relaxed">
          {t("lp.ways.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(({ icon: Icon, delay, tag, title, desc, steps, cta }) => (
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
                <div key={i} className="flex items-center gap-3">
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
  const { t } = useI18n();
  const [ref, vis] = useReveal();
  const features = [
    { icon: Lock, title: t("lp.feat.spendLimits"), desc: t("lp.feat.spendLimitsDesc") },
    { icon: Clock, title: t("lp.feat.autoExpiry"), desc: t("lp.feat.autoExpiryDesc") },
    { icon: Shield, title: t("lp.feat.recipientLock"), desc: t("lp.feat.recipientLockDesc") },
    { icon: Zap, title: t("lp.feat.sessionKeys"), desc: t("lp.feat.sessionKeysDesc") },
  ];

  return (
    <section ref={ref} className="py-32 px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className={`text-center mb-16 transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{t("lp.feat.badge")}</span>
        <h2 className="mt-4 font-black tracking-tight" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(32px,5vw,52px)" }}>
          {t("lp.feat.title1")}<br />{t("lp.feat.title2")}
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={i}
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
  const { t } = useI18n();
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="py-32 px-6 text-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(183,78,111,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className={`max-w-[580px] mx-auto relative transition-all duration-900 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <h2 className="font-black tracking-tight mb-6" style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: "clamp(36px,6vw,66px)", lineHeight: 1 }}>
          {t("lp.cta.title1")}<br /><span className="text-primary">{t("lp.cta.title2")}</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-[420px] mx-auto">
          {t("lp.cta.desc")}
        </p>
        <button onClick={onConnect}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
          {t("lp.cta.btn")} <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-5 text-xs text-muted-foreground/40">{t("lp.cta.note")}</p>
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
  return <KixaLPInner />;
}
