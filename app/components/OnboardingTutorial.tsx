"use client";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Shield, ArrowRight, ArrowLeft, X, Sparkles, Check, Lock, Brain } from "lucide-react";

const ICON_WRAP = "w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0";
const CARD = "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50";

function Illus1() {
  return (
    <div className="h-40 flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center" style={{ animation: "pulse-soft 2s ease-in-out infinite" }}>
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary/30" style={{ animation: "float 3s ease-in-out infinite" }} />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary/20" style={{ animation: "float 4s ease-in-out infinite 0.5s" }} />
      </div>
    </div>
  );
}

function Illus2() {
  return (
    <div className="h-40 flex items-center justify-center gap-4">
      {[
        { icon: Shield, label: "Quick Permission", sub: "For existing agents" },
        { icon: Brain, label: "AI Agent Builder", sub: "Build from scratch" },
      ].map(({ icon: Icon, label, sub }, i) => (
        <div key={label} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-muted/40 border border-border/50 w-[130px]"
          style={{ animation: "fade-up 0.35s ease-out " + (i * 0.15) + "s forwards", opacity: 0 }}>
          <div className={ICON_WRAP}><Icon className="w-5 h-5 text-primary" /></div>
          <div className="text-center">
            <p className="text-[11px] font-bold">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Illus3() {
  return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      {[
        { icon: Shield, label: "Spend Limit", sub: "Max 5 SOL · 7 days", delay: "0s" },
        { icon: Lock, label: "DCA", sub: "10 SOL weekly · 90 days", delay: "0.15s" },
      ].map(({ icon: Icon, label, sub, delay }) => (
        <div key={label} className={CARD} style={{ animation: "fade-up 0.35s ease-out " + delay + " forwards", opacity: 0 }}>
          <div className={ICON_WRAP}><Icon className="w-4 h-4 text-primary" /></div>
          <div className="flex-1"><p className="text-[12px] font-semibold">{label}</p><p className="text-[10px] text-muted-foreground">{sub}</p></div>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">active</span>
        </div>
      ))}
    </div>
  );
}

function Illus4() {
  return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      <div className={CARD} style={{ animation: "fade-up 0.35s ease-out forwards" }}>
        <div className={ICON_WRAP} style={{ animation: "pulse-soft 2s ease-in-out infinite" }}><Brain className="w-4 h-4 text-primary" /></div>
        <p className="text-[11px] text-muted-foreground">"DCA 10 SOL weekly into ETH"</p>
      </div>
      <div className="flex gap-2" style={{ animation: "fade-up 0.35s ease-out 0.25s forwards", opacity: 0 }}>
        {["Spend: 10 SOL", "Weekly", "Auto-renew"].map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1.5 rounded-lg bg-success/10 text-success border border-success/20">
            <Check className="w-2.5 h-2.5" />{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function Illus5() {
  return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      {[
        { label: "Spend limit enforced on-chain", delay: "0s" },
        { label: "Auto-expiration after deadline", delay: "0.12s" },
        { label: "Recipient lock prevents misuse", delay: "0.24s" },
      ].map(({ label, delay }) => (
        <div key={label} className={CARD} style={{ animation: "fade-up 0.35s ease-out " + delay + " forwards", opacity: 0 }}>
          <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-success" /></div>
          <span className="text-[11px] font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Illus6() {
  return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      {[
        { label: "Spend limit created", dot: "bg-success", time: "2m ago", delay: "0s" },
        { label: "DCA Bot executed swap", dot: "bg-primary", time: "1h ago", delay: "0.12s" },
        { label: "Permission auto-expired", dot: "bg-muted-foreground", time: "2d ago", delay: "0.24s" },
      ].map(({ label, dot, time, delay }) => (
        <div key={label} className={CARD} style={{ animation: "fade-up 0.35s ease-out " + delay + " forwards", opacity: 0 }}>
          <div className={"w-2 h-2 rounded-full shrink-0 " + dot} />
          <span className="text-[11px] font-medium flex-1">{label}</span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
      ))}
    </div>
  );
}

const steps = [
  { Illus: Illus1, badge: "Welcome", title: "Your AI agent.\nYour rules.", subtitle: "On-chain permission protocol for Solana.", desc: "KIXA lets you define exactly what your AI agent can do before it acts. You stay in control, always." },
  { Illus: Illus2, badge: "How it works", title: "Two ways\nto get started.", subtitle: "Pick the flow that works for you.", desc: "Grant permissions to an existing agent instantly, or use the AI Builder to create a new agent with rules configured automatically." },
  { Illus: Illus3, badge: "Permissions", title: "You decide\nwhat it can do.", subtitle: "Limits enforced before any action.", desc: "Set spend limits, token types and expiration dates. Your agent will never go beyond what you approved." },
  { Illus: Illus4, badge: "AI Builder", title: "Describe it.\nAI handles the rest.", subtitle: "No code. No complexity.", desc: "Tell our AI what you want your agent to do. It configures the permissions and deploys everything on-chain for you." },
  { Illus: Illus5, badge: "Security", title: "Safe by design.\nAlways.", subtitle: "Rules that cannot be bypassed.", desc: "Session keys enforce every rule on-chain. Spend limits, auto-expiration and recipient locks protect your wallet at all times." },
  { Illus: Illus6, badge: "Activity", title: "Every action\nlogged for you.", subtitle: "Full transparency on what happened.", desc: "See every permission created, executed or revoked with timestamps. Nothing your agent does goes untracked." },
];

export interface OnboardingTutorialHandle { open: () => void; }

const OnboardingTutorial = forwardRef<OnboardingTutorialHandle>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("next");
  const [animating, setAnimating] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("kixa-onboarding-done")) setVisible(true);
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => { setCurrent(0); setContentKey(k => k + 1); setVisible(true); },
  }));

  const transition = (idx: number, dir: string) => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => { setCurrent(idx); setContentKey(k => k + 1); setAnimating(false); }, 200);
  };

  const handleNext = () => current < steps.length - 1 ? transition(current + 1, "next") : handleClose();
  const handlePrev = () => current > 0 && transition(current - 1, "prev");
  const handleClose = () => { localStorage.setItem("kixa-onboarding-done", "true"); setVisible(false); };

  if (!visible) return null;

  const s = steps[current];
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;
  const contentClass = animating ? (direction === "next" ? "opacity-0 translate-x-3" : "opacity-0 -translate-x-3") : "opacity-100 translate-x-0";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm">
        <div style={{background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:16,padding:32,position:"relative",overflow:"hidden",width:"100%",maxWidth:400}}>
          <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (<div key={i} className={"h-1 rounded-full transition-all duration-300 " + (i === current ? "w-6 bg-primary" : i < current ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20")} />))}
          </div>
          <div className={"transition-all duration-200 ease-out " + contentClass} key={contentKey}>
            <s.Illus />
            <div className="flex justify-center mt-5 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">{current + 1} of {steps.length} · {s.badge}</span>
            </div>
            <h3 className="text-[22px] font-bold tracking-tight leading-snug whitespace-pre-line text-center mb-2">{s.title}</h3>
            <p className="text-[13px] font-medium text-primary text-center mb-3">{s.subtitle}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed text-center mb-7">{s.desc}</p>
          </div>
          <div className="flex items-center justify-between">
            {isFirst ? (
              <button onClick={handleClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Skip</button>
            ) : (
              <button onClick={handlePrev} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>
            )}
            <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97]">
              {isLast ? "Get Started" : "Next"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OnboardingTutorial.displayName = "OnboardingTutorial";
export default OnboardingTutorial;
