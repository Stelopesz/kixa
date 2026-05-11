"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ── TRANSLATIONS ──────────────────────────────────────────────
const T = {
  en: {
    nav: { how: "How it works", dev: "For developers", docs: "Docs", connect: "Connect Wallet" },
    kicker: "AI Permission Protocol · Solana",
    h1: "Your agent.",
    h2: "Your rules.",
    sub: "You decide what an AI agent can spend, where it sends, and for how long. The contract holds the line. Always.",
    cta: "Connect Phantom",
    docs: "View docs →",
    scroll: "SCROLL",
    ticker: ["On-chain permissions", "Zero access drift", "Auto-expiration", "Revoke anytime", "Spend limits", "Recipient lock", "Agent economy", "Solana mainnet live"],
    howLabel: "How it works",
    howTitle: "Set it once.",
    howAccent: " Rest easy.",
    steps: [
      { n: "01", t: "Connect wallet", d: "Sign in with Phantom. No account, no form, no waiting." },
      { n: "02", t: "Define the rule", d: "Agent, token, limit, recipient, expiration. You control everything." },
      { n: "03", t: "Grant on-chain", d: "One transaction. Written to the contract. Immutable from that moment on." },
      { n: "04", t: "Revoke anytime", d: "One click. The agent loses access immediately. No delay." },
    ],
    s1Label: "What KIXA does",
    s1Title: "An agent can only do",
    s1Accent: " what you allow.",
    s1Body: "You set the wallet. You set the limit. You set the time window. Once it is on-chain, the contract does not negotiate. Your rules hold even when you are not watching.",
    feats: [
      { t: "Spend limit", d: "Cap exactly how much SOL or any SPL token an agent can move." },
      { t: "Recipient lock", d: "Bind the agent to one specific wallet. It cannot send to anyone else." },
      { t: "Auto-expiration", d: "Set a timestamp. When it hits, the contract enforces it automatically." },
    ],
    cardToken: "Token", cardMax: "Max spend", cardRecipient: "Recipient", cardExpires: "Expires",
    cardActive: "Active", cardSpend: "Spend usage", cardRevoke: "Revoke →", cardLog: "View log",
    s2Label: "Agent log",
    s2Title: "Every move is",
    s2Accent: " on record.",
    s2Body: "Approved. Blocked. Expired. Every action your agent attempts is logged on-chain the moment it happens. You do not need to ask what happened. You can see it.",
    liveFeed: "Live feed", live: "Live",
    tq: ["What an agent can do is written on the", "blockchain", ", not on your faith."],
    footerTitle: "Grant once.",
    footerAccent: " Control forever.",
    footerSub: "Your rules. Your agent. On-chain and always enforced.",
    footerCta: "Connect Wallet →",
    footerCopy: "© 2026 KIXA · Colosseum Frontier · Solana",
  },
  pt: {
    nav: { how: "Como funciona", dev: "Para devs", docs: "Docs", connect: "Conectar Wallet" },
    kicker: "Protocolo de Permissões IA · Solana",
    h1: "O seu agente.",
    h2: "As suas regras.",
    sub: "Você decide o que um agente pode gastar, para onde enviar e por quanto tempo. O contrato mantém o limite. Sempre.",
    cta: "Conectar Phantom",
    docs: "Ver docs →",
    scroll: "SCROLL",
    ticker: ["Permissões on-chain", "Zero acesso indevido", "Expiração automática", "Revogar a qualquer momento", "Limites de gasto", "Destinatário fixo", "Economia de agentes", "Solana mainnet live"],
    howLabel: "Como funciona",
    howTitle: "Configure uma vez.",
    howAccent: " Descanse tranquilo.",
    steps: [
      { n: "01", t: "Conectar carteira", d: "Entre com Phantom. Sem conta, sem formulário, sem espera." },
      { n: "02", t: "Definir a regra", d: "Agente, token, limite, destinatário, expiração. Você controla tudo." },
      { n: "03", t: "Registrar on-chain", d: "Uma transação. Gravada no contrato. Imutável a partir desse momento." },
      { n: "04", t: "Revogar a qualquer momento", d: "Um clique. O agente perde o acesso imediatamente. Sem delay." },
    ],
    s1Label: "O que o KIXA faz",
    s1Title: "Um agente só pode fazer",
    s1Accent: " o que você permite.",
    s1Body: "Você define a carteira. Você define o limite. Você define a janela de tempo. Uma vez on-chain, o contrato não negocia. Suas regras valem mesmo quando você não está olhando.",
    feats: [
      { t: "Limite de gasto", d: "Defina exatamente quanto SOL ou token SPL um agente pode mover." },
      { t: "Destinatário fixo", d: "Vincule o agente a uma carteira específica. Ele não pode enviar para mais ninguém." },
      { t: "Expiração automática", d: "Defina um timestamp. Quando bater, o contrato executa automaticamente." },
    ],
    cardToken: "Token", cardMax: "Limite máximo", cardRecipient: "Destinatário", cardExpires: "Expira",
    cardActive: "Ativo", cardSpend: "Uso do limite", cardRevoke: "Revogar →", cardLog: "Ver registro",
    s2Label: "Log do agente",
    s2Title: "Cada movimento está",
    s2Accent: " registrado.",
    s2Body: "Aprovado. Bloqueado. Expirado. Cada ação que seu agente tenta é registrada on-chain no momento em que acontece. Você não precisa perguntar o que ocorreu. Você pode ver.",
    liveFeed: "Feed ao vivo", live: "Ao vivo",
    tq: ["O que um agente pode fazer está escrito na", "blockchain", ", não na sua fé."],
    footerTitle: "Autorize uma vez.",
    footerAccent: " Controle para sempre.",
    footerSub: "Suas regras. Seu agente. On-chain e sempre executado.",
    footerCta: "Conectar Wallet →",
    footerCopy: "© 2026 KIXA · Colosseum Frontier · Solana",
  },
  es: {
    nav: { how: "Cómo funciona", dev: "Para devs", docs: "Docs", connect: "Conectar Wallet" },
    kicker: "Protocolo de Permisos IA · Solana",
    h1: "Tu agente.",
    h2: "Tus reglas.",
    sub: "Tú decides qué puede gastar un agente, a dónde puede enviar y por cuánto tiempo. El contrato mantiene el límite. Siempre.",
    cta: "Conectar Phantom",
    docs: "Ver docs →",
    scroll: "SCROLL",
    ticker: ["Permisos on-chain", "Cero acceso excesivo", "Expiración automática", "Revocar en cualquier momento", "Límites de gasto", "Destinatario fijo", "Economía de agentes", "Solana mainnet live"],
    howLabel: "Cómo funciona",
    howTitle: "Configúralo una vez.",
    howAccent: " Descansa tranquilo.",
    steps: [
      { n: "01", t: "Conectar wallet", d: "Entra con Phantom. Sin cuenta, sin formulario, sin espera." },
      { n: "02", t: "Definir la regla", d: "Agente, token, límite, destinatario, expiración. Tú controlas todo." },
      { n: "03", t: "Registrar on-chain", d: "Una transacción. Escrita en el contrato. Inmutable desde ese momento." },
      { n: "04", t: "Revocar en cualquier momento", d: "Un clic. El agente pierde acceso inmediatamente. Sin demora." },
    ],
    s1Label: "Qué hace KIXA",
    s1Title: "Un agente solo puede hacer",
    s1Accent: " lo que tú permites.",
    s1Body: "Tú defines la wallet. Tú defines el límite. Tú defines la ventana de tiempo. Una vez on-chain, el contrato no negocia. Tus reglas se mantienen incluso cuando no estás mirando.",
    feats: [
      { t: "Límite de gasto", d: "Define exactamente cuánto SOL o token SPL puede mover un agente." },
      { t: "Destinatario fijo", d: "Vincula el agente a una wallet específica. No puede enviar a nadie más." },
      { t: "Expiración automática", d: "Define un timestamp. Cuando llegue, el contrato lo ejecuta." },
    ],
    cardToken: "Token", cardMax: "Límite máximo", cardRecipient: "Destinatario", cardExpires: "Expira",
    cardActive: "Activo", cardSpend: "Uso del límite", cardRevoke: "Revocar →", cardLog: "Ver registro",
    s2Label: "Registro del agente",
    s2Title: "Cada movimiento está",
    s2Accent: " registrado.",
    s2Body: "Aprobado. Bloqueado. Expirado. Cada acción que intenta tu agente queda registrada on-chain en el momento en que ocurre. No necesitas preguntar qué pasó. Puedes verlo.",
    liveFeed: "Feed en vivo", live: "En vivo",
    tq: ["Lo que un agente puede hacer está escrito en la", "blockchain", ", no en tu fe."],
    footerTitle: "Autoriza una vez.",
    footerAccent: " Controla para siempre.",
    footerSub: "Tus reglas. Tu agente. On-chain y siempre ejecutado.",
    footerCta: "Conectar Wallet →",
    footerCopy: "© 2026 KIXA · Colosseum Frontier · Solana",
  },
} as const;

type Lang = keyof typeof T;

// ── LOG ENTRIES ───────────────────────────────────────────────
const LOG_ENTRIES = [
  { time: "10:22:14", type: "ok" as const, label: "APPROVED", detail: "0.05 SOL sent within limit" },
  { time: "10:23:01", type: "ok" as const, label: "APPROVED", detail: "0.08 SOL · 0.13/0.50 used" },
  { time: "10:23:38", type: "bl" as const, label: "BLOCKED", detail: "unauthorized recipient" },
  { time: "10:24:12", type: "ok" as const, label: "APPROVED", detail: "0.06 SOL · 0.19/0.50 used" },
  { time: "10:25:05", type: "wn" as const, label: "EXPIRED", detail: "Portfolio Bot · auto-revoked" },
  { time: "10:26:44", type: "bl" as const, label: "BLOCKED", detail: "0.35 SOL · limit exceeded" },
];

const SPEND_STEPS = [
  { w: "10%", v: "0.05 / 0.50 SOL" },
  { w: "26%", v: "0.13 / 0.50 SOL" },
  { w: "38%", v: "0.19 / 0.50 SOL" },
];

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function KixaLP() {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(true);
  const [connected, setConnected] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const [spendStep, setSpendStep] = useState(0);
  const [s1Visible, setS1Visible] = useState(false);
  const [s2Visible, setS2Visible] = useState(false);

  const s = T[lang];
  const hcvRef = useRef<HTMLCanvasElement>(null);
  const fcvRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);

  // ── CURSOR ─────────────────────────────────────────────────
  useEffect(() => {
    const cur = cursorRef.current;
    if (!cur) return;
    let cx = 0, cy = 0, tx = 0, ty = 0, angle = 0, speed = 0, lx = 0, ly = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      speed = Math.hypot(e.clientX - lx, e.clientY - ly);
      lx = e.clientX; ly = e.clientY;
      cur.classList.add("visible");
    };
    const onLeave = () => cur.classList.remove("visible");

    const loop = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      angle += 0.04 + speed * 0.003;
      speed *= 0.9;
      cur.style.left = cx + "px";
      cur.style.top = cy + "px";
      cur.style.transform = `translate(-50%,-50%) rotate(${angle}rad)`;
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── HERO CANVAS ────────────────────────────────────────────
  useEffect(() => {
    const cv = hcvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let W = 0, H = 0, t = 0;
    type Orb = { x: number; y: number; r: number; vx: number; vy: number; c: [number, number, number]; a: number; ph: number };
    let orbs: Orb[] = [];
    let raf: number;

    const resize = () => {
      const rect = cv.parentElement!.getBoundingClientRect();
      W = cv.width = rect.width || 700;
      H = cv.height = 600;
    };

    const mkOrb = (): Orb => ({
      x: W * (0.1 + Math.random() * 0.8),
      y: H * (0.05 + Math.random() * 0.9),
      r: 80 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      c: Math.random() > 0.5 ? [183, 78, 111] : [103, 67, 112],
      a: 0.12 + Math.random() * 0.1,
      ph: Math.random() * Math.PI * 2,
    });

    const init = () => { orbs = Array.from({ length: 8 }, mkOrb); };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t += 0.007;

      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const p = o.a * (0.75 + 0.25 * Math.sin(t * 0.5 + o.ph)) * (dark ? 1 : 1.8);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c.join(",")},${p})`);
        g.addColorStop(1, `rgba(${o.c.join(",")},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const vig = ctx.createLinearGradient(W * 0.42, 0, W, 0);
      const bgColor = dark ? "13,8,16" : "250,240,244";
      vig.addColorStop(0, `rgba(${bgColor},0)`);
      vig.addColorStop(1, `rgba(${bgColor},0.45)`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    resize();
    init();
    loop();
    window.addEventListener("resize", () => { resize(); init(); });
    return () => cancelAnimationFrame(raf);
  }, [dark]);

  // ── FOOTER CANVAS ──────────────────────────────────────────
  useEffect(() => {
    const fc = fcvRef.current;
    if (!fc) return;
    let fr = 0, raf: number;
    type FOrb = { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number };
    let forbs: FOrb[] = [];

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = fc.parentElement!.getBoundingClientRect();
      fc.width = p.width || 700;
      fc.height = p.height || 280;
      const fctx = fc.getContext("2d")!;
      fctx.clearRect(0, 0, fc.width, fc.height);
      fr += 0.003;

      if (!forbs.length) {
        forbs = Array.from({ length: 5 }, (_, i) => ({
          x: fc.width * (0.1 + i * 0.2),
          y: fc.height * (0.2 + Math.random() * 0.6),
          r: 80 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.12,
          a: 0.13 + Math.random() * 0.08,
          ph: Math.random() * Math.PI * 2,
        }));
      }

      forbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = fc.width + o.r;
        if (o.x > fc.width + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = fc.height + o.r;
        if (o.y > fc.height + o.r) o.y = -o.r;
        const pulse = o.a * (0.7 + 0.3 * Math.sin(fr + o.ph));
        const g = fctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(183,78,111,${pulse})`);
        g.addColorStop(1, "rgba(183,78,111,0)");
        fctx.fillStyle = g;
        fctx.beginPath();
        fctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        fctx.fill();
      });
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── SCROLL REVEAL ──────────────────────────────────────────
  const checkVisible = useCallback(() => {
    const vh = window.innerHeight;
    if (s1Ref.current) {
      const r = s1Ref.current.getBoundingClientRect();
      if (r.top < vh * 0.9 && !s1Visible) {
        setS1Visible(true);
        SPEND_STEPS.forEach((step, i) => {
          setTimeout(() => setSpendStep(i + 1), 700 + i * 900);
        });
      }
    }
    if (s2Ref.current) {
      const r = s2Ref.current.getBoundingClientRect();
      if (r.top < vh * 0.9 && !s2Visible) {
        setS2Visible(true);
        LOG_ENTRIES.forEach((_, i) => {
          setTimeout(() => setVisibleRows(prev => [...prev, i]), 300 + i * 460);
        });
      }
    }
  }, [s1Visible, s2Visible]);

  useEffect(() => {
    const container = document.querySelector("main");
    if (container) container.addEventListener("scroll", checkVisible, { passive: true });
    window.addEventListener("scroll", checkVisible, { passive: true });
    const interval = setInterval(checkVisible, 200);
    checkVisible();
    return () => {
      if (container) container.removeEventListener("scroll", checkVisible);
      window.removeEventListener("scroll", checkVisible);
      clearInterval(interval);
    };
  }, [checkVisible]);

  // ── THEME ──────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle("light", !dark);
  }, [dark]);

  const spendPct = SPEND_STEPS[spendStep - 1];

  return (
    <>
      {/* CURSOR */}
      <div id="kixa-cursor" ref={cursorRef}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C20 2 27 14 38 20C27 26 20 38 20 38C20 38 13 26 2 20C13 14 20 2 20 2Z" fill="#b74e6f"/>
          <circle cx="20" cy="2" r="3" fill="#0d0810"/>
          <circle cx="38" cy="20" r="3" fill="#0d0810"/>
          <circle cx="20" cy="38" r="3" fill="#0d0810"/>
          <circle cx="2" cy="20" r="3" fill="#0d0810"/>
          <path d="M20 15L23 20L20 25L17 20Z" fill="#f4bdbd" opacity="0.7"/>
        </svg>
      </div>

      <main className="relative overflow-x-hidden min-h-screen"
        style={{ background: dark ? "#0d0810" : "#faf0f4", color: dark ? "#f4bdbd" : "#261d24", cursor: "none" }}>

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-12 py-5 sticky top-0 z-50"
          style={{ background: dark ? "rgba(13,8,16,0.95)" : "rgba(250,240,244,0.95)", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.1)" : "rgba(183,78,111,0.12)"}`, backdropFilter: "blur(16px)" }}>
          <div className="font-archivo text-xl tracking-tight" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
            Ki<span style={{ color: "#b74e6f" }}>X</span>a
          </div>
          <div className="hidden md:flex gap-8">
            {[s.nav.how, s.nav.dev, s.nav.docs].map(l => (
              <a key={l} className="text-sm font-host transition-colors"
                style={{ color: dark ? "rgba(244,189,189,0.35)" : "rgba(38,29,36,0.4)", cursor: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = dark ? "#f4bdbd" : "#261d24")}
                onMouseLeave={e => (e.currentTarget.style.color = dark ? "rgba(244,189,189,0.35)" : "rgba(38,29,36,0.4)")}>
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* LANG */}
            <div className="relative">
              <button onClick={() => setLangOpen(v => !v)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(183,78,111,0.06)", border: `1px solid ${dark ? "rgba(183,78,111,0.15)" : "rgba(183,78,111,0.2)"}`, cursor: "none" }}>
                🌐
              </button>
              {langOpen && (
                <div className="absolute top-11 right-0 rounded-xl overflow-hidden z-50 min-w-[130px]"
                  style={{ background: dark ? "#1e0f24" : "#fff", border: `1px solid rgba(183,78,111,0.2)`, boxShadow: "0 16px 40px rgba(0,0,0,0.3)", animation: "slideIn 0.2s ease" }}>
                  {(["en", "pt", "es"] as Lang[]).map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      className="w-full px-4 py-3 text-xs text-left flex items-center gap-2 transition-all font-host"
                      style={{ color: lang === l ? "#b74e6f" : dark ? "rgba(244,189,189,0.5)" : "rgba(38,29,36,0.5)", cursor: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(183,78,111,0.1)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {l === "en" ? "🇺🇸 English" : l === "pt" ? "🇧🇷 Português" : "🇪🇸 Español"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* THEME */}
            <button onClick={() => setDark(v => !v)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(183,78,111,0.06)", border: `1px solid ${dark ? "rgba(183,78,111,0.15)" : "rgba(183,78,111,0.2)"}`, cursor: "none" }}>
              {dark ? "☾" : "☀"}
            </button>
            {/* CONNECT */}
            <button onClick={() => setConnected(v => !v)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold font-host transition-all relative overflow-hidden"
              style={{ background: connected ? "rgba(183,78,111,0.15)" : "#b74e6f", color: connected ? "#b74e6f" : "#f4bdbd", border: connected ? "1px solid rgba(183,78,111,0.4)" : "none", cursor: "none" }}>
              {connected ? "7Xk2...f9aB ✓" : s.nav.connect}
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <canvas ref={hcvRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* SHURIKEN RIGHT */}
          <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] z-10 pointer-events-none">
            <div className="animate-glow-pulse absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(183,78,111,0.18) 0%, transparent 65%)" }} />
            <svg className="animate-spin-slow w-full h-full" viewBox="0 0 200 200" fill="none">
              <path d="M100 8C115 55 145 85 192 100C145 115 115 145 100 192C85 145 55 115 8 100C55 85 85 55 100 8Z" fill="#b74e6f" opacity="0.92"/>
              <circle cx="100" cy="8" r="8" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="192" cy="100" r="8" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="100" cy="192" r="8" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="8" cy="100" r="8" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="100" cy="100" r="4" fill="#f4bdbd" opacity="0.5"/>
            </svg>
            <svg className="animate-spin-reverse absolute w-[44%] h-[44%]" style={{ inset: "28%" }} viewBox="0 0 200 200" fill="none">
              <path d="M100 8C115 55 145 85 192 100C145 115 115 145 100 192C85 145 55 115 8 100C55 85 85 55 100 8Z" fill="#674370" opacity="0.8"/>
              <circle cx="100" cy="8" r="9" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="192" cy="100" r="9" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="100" cy="192" r="9" fill={dark ? "#0d0810" : "#faf0f4"}/>
              <circle cx="8" cy="100" r="9" fill={dark ? "#0d0810" : "#faf0f4"}/>
            </svg>
          </div>

          {/* COPY */}
          <div className="relative z-20 px-12 max-w-[500px]">
            <div className="flex items-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#b74e6f] animate-pulse-dot" />
              <span className="text-[10px] tracking-[3px] uppercase font-medium font-host" style={{ color: "rgba(183,78,111,0.65)" }}>
                {s.kicker}
              </span>
            </div>
            <h1 className="font-archivo text-[64px] leading-[0.93] tracking-[-2.5px] mb-2 animate-fade-up"
              style={{ animationDelay: "0.2s", color: dark ? "#f4bdbd" : "#261d24" }}>
              {s.h1}
            </h1>
            <span className="font-archivo text-[60px] leading-[0.93] tracking-[-2.5px] block mb-8 animate-fade-up"
              style={{ animationDelay: "0.3s", color: "#b74e6f" }}>
              {s.h2}
            </span>
            <p className="text-[15px] leading-[1.78] font-light mb-10 max-w-[360px] animate-fade-up font-host"
              style={{ animationDelay: "0.4s", color: dark ? "rgba(244,189,189,0.45)" : "rgba(38,29,36,0.5)" }}>
              {s.sub}
            </p>
            <div className="flex gap-3 items-center animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <button onClick={() => setConnected(v => !v)}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold font-host transition-all relative overflow-hidden group"
                style={{ background: "#b74e6f", color: "#f4bdbd", cursor: "none" }}>
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: "#9945ff" }} />
                <span>{connected ? "Connected ✓" : s.cta}</span>
              </button>
              <button className="text-sm font-host transition-colors"
                style={{ color: dark ? "rgba(244,189,189,0.38)" : "rgba(38,29,36,0.4)", cursor: "none" }}>
                {s.docs}
              </button>
            </div>
          </div>

          {/* SCROLL HINT */}
          <div className="absolute bottom-6 left-12 z-20 flex items-center gap-2.5">
            <div className="w-8 h-px animate-scroll-drop" style={{ background: "linear-gradient(to right, #b74e6f, transparent)" }} />
            <span className="text-[9px] tracking-[3px] uppercase font-host" style={{ color: dark ? "rgba(244,189,189,0.25)" : "rgba(38,29,36,0.3)" }}>
              {s.scroll}
            </span>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="h-10 overflow-hidden flex items-center" style={{ background: "#b74e6f" }}>
          <div className="inline-flex whitespace-nowrap animate-marquee">
            {[...s.ticker, ...s.ticker].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-5 px-2.5 text-[10px] tracking-[2px] uppercase font-semibold font-host" style={{ color: "rgba(244,189,189,0.82)" }}>
                {item}
                <span className="w-[3px] h-[3px] rounded-full flex-shrink-0" style={{ background: "rgba(244,189,189,0.35)" }} />
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-12" style={{ background: dark ? "#160d1a" : "#f2e2ea", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.08)" : "rgba(183,78,111,0.12)"}` }}>
          <div className="max-w-[960px] mx-auto reveal visible">
            <div className="text-center mb-14">
              <div className="text-[10px] tracking-[3px] uppercase font-medium font-host mb-4" style={{ color: "rgba(183,78,111,0.55)" }}>
                {s.howLabel}
              </div>
              <h2 className="font-archivo text-[36px] tracking-[-0.5px]" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
                {s.howTitle}<span style={{ color: "#b74e6f" }}>{s.howAccent}</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {s.steps.map((step, i) => (
                <div key={i} className="p-6 rounded-2xl relative overflow-hidden transition-all duration-300 card-glow"
                  style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)", border: `1px solid ${dark ? "rgba(183,78,111,0.1)" : "rgba(183,78,111,0.15)"}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px) scale(1.02)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(183,78,111,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(183,78,111,0.1)" : "rgba(183,78,111,0.15)"; }}>
                  <div className="font-archivo text-[48px] tracking-[-2px] leading-none absolute top-3 right-4" style={{ color: "rgba(183,78,111,0.07)" }}>
                    {step.n}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all"
                    style={{ background: "rgba(183,78,111,0.1)" }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#b74e6f" strokeWidth="1.5">
                      {i === 0 && <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>}
                      {i === 1 && <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>}
                      {i === 2 && <polyline points="20 6 9 17 4 12"/>}
                      {i === 3 && <><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></>}
                    </svg>
                  </div>
                  <div className="text-sm font-semibold mb-2 font-host transition-colors" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
                    {step.t}
                  </div>
                  <div className="text-xs font-light leading-relaxed font-host" style={{ color: dark ? "rgba(244,189,189,0.4)" : "rgba(38,29,36,0.5)" }}>
                    {step.d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 1 — PERMISSION CARD ── */}
        <section className="py-20 px-12 relative overflow-hidden"
          style={{ background: dark ? "#0d0810" : "#faf0f4", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.07)" : "rgba(183,78,111,0.1)"}` }}>
          <div className="absolute w-72 h-72 rounded-full -top-16 -right-10 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(183,78,111,0.08), transparent 70%)" }} />
          <div ref={s1Ref} className={`max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center reveal ${s1Visible ? "visible" : ""}`}>
            <div>
              <div className="text-[10px] tracking-[3.5px] uppercase font-medium font-host mb-5" style={{ color: "rgba(183,78,111,0.55)" }}>
                {s.s1Label}
              </div>
              <h2 className="font-archivo text-[34px] leading-[1.1] tracking-[-0.5px] mb-5" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
                {s.s1Title}<span style={{ color: "#b74e6f" }}>{s.s1Accent}</span>
              </h2>
              <p className="text-[15px] leading-[1.85] font-light font-host" style={{ color: dark ? "rgba(244,189,189,0.45)" : "rgba(38,29,36,0.5)" }}>
                {s.s1Body}
              </p>
              <div className="flex flex-col gap-3 mt-7">
                {s.feats.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all"
                    style={{ cursor: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(183,78,111,0.07)"; (e.currentTarget as HTMLElement).style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                      style={{ background: "rgba(183,78,111,0.1)" }}>
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="#b74e6f" strokeWidth="2.2">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1 font-host" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>{f.t}</div>
                      <div className="text-xs font-light leading-relaxed font-host" style={{ color: dark ? "rgba(244,189,189,0.4)" : "rgba(38,29,36,0.45)" }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PERMISSION CARD */}
            <div className="rounded-2xl overflow-hidden transition-all duration-500"
              style={{ background: dark ? "#100814" : "#ffffff", border: `1px solid ${dark ? "rgba(183,78,111,0.15)" : "rgba(183,78,111,0.18)"}`, boxShadow: dark ? "0 12px 48px rgba(0,0,0,0.25)" : "0 4px 24px rgba(183,78,111,0.1)" }}
              onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                (e.currentTarget as HTMLElement).style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.01)`;
              }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
              {/* Card head */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.08)" : "rgba(183,78,111,0.1)"}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(183,78,111,0.1)" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#b74e6f" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold font-host" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>DeFi Scout</div>
                  <div className="text-[10px] font-mono" style={{ color: dark ? "rgba(244,189,189,0.35)" : "rgba(38,29,36,0.4)" }}>7Xk2...f9aB</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium font-host" style={{ background: "rgba(77,212,154,0.1)", color: "#4dd49a", border: "1px solid rgba(77,212,154,0.2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4dd49a] animate-pulse-dot" />
                  {s.cardActive}
                </div>
              </div>
              {/* Rows */}
              {[
                { k: s.cardToken, v: "SOL", cls: "" },
                { k: s.cardMax, v: "0.50 SOL", cls: "text-[#f0b060]" },
                { k: s.cardRecipient, v: "3Rk5...a2Cd", cls: "text-[#7fbfff] font-mono text-[11px]" },
                { k: s.cardExpires, v: "May 15, 2026", cls: "text-[#7fbfff] text-[11px]" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-3 transition-colors"
                  style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.025)" : "rgba(183,78,111,0.06)"}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(183,78,111,0.04)" : "rgba(183,78,111,0.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <span className="text-[11px] font-host" style={{ color: dark ? "rgba(244,189,189,0.4)" : "rgba(38,29,36,0.45)" }}>{row.k}</span>
                  <span className={`text-sm font-semibold font-host ${row.cls}`} style={!row.cls ? { color: dark ? "#f4bdbd" : "#261d24" } : {}}>{row.v}</span>
                </div>
              ))}
              {/* Spend bar */}
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.07)" : "rgba(183,78,111,0.08)"}` }}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-host" style={{ color: dark ? "rgba(244,189,189,0.4)" : "rgba(38,29,36,0.45)" }}>{s.cardSpend}</span>
                  <span className="text-[11px] font-mono font-medium" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
                    {spendPct?.v || "0.00 / 0.50 SOL"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(183,78,111,0.12)" }}>
                  <div className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                    style={{ width: spendPct?.w || "0%", background: "linear-gradient(90deg, #b74e6f, #f4bdbd)" }} />
                </div>
              </div>
              {/* Footer */}
              <div className="px-5 py-4 flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold font-host transition-all"
                  style={{ background: "transparent", border: "1px solid rgba(183,78,111,0.22)", color: "#b74e6f", cursor: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(183,78,111,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {s.cardRevoke}
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold font-host transition-all"
                  style={{ background: "rgba(183,78,111,0.07)", border: "1px solid rgba(183,78,111,0.12)", color: dark ? "rgba(244,189,189,0.55)" : "rgba(38,29,36,0.5)", cursor: "none" }}>
                  {s.cardLog}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2 — TERMINAL ── */}
        <section className="py-20 px-12 relative overflow-hidden"
          style={{ background: dark ? "#160d1a" : "#f2e2ea", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.07)" : "rgba(183,78,111,0.1)"}` }}>
          <div className="absolute w-64 h-64 rounded-full -bottom-10 -left-8 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(103,67,112,0.1), transparent 70%)" }} />
          <div ref={s2Ref} className={`max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center reveal ${s2Visible ? "visible" : ""}`}>
            <div className="order-2 md:order-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[3px] uppercase font-medium font-host" style={{ color: "rgba(183,78,111,0.55)" }}>{s.liveFeed}</span>
                <div className="flex items-center gap-1.5 text-[11px] font-host" style={{ color: "#4dd49a" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4dd49a] animate-pulse-dot" />
                  {s.live}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden transition-all duration-500"
                style={{ background: dark ? "#080510" : "#ffffff", border: `1px solid ${dark ? "rgba(183,78,111,0.1)" : "rgba(183,78,111,0.15)"}`, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 4px 20px rgba(183,78,111,0.08)" }}
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width - 0.5;
                  const y = (e.clientY - r.top) / r.height - 0.5;
                  (e.currentTarget as HTMLElement).style.transform = `translateY(-5px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: dark ? "rgba(54,23,61,0.3)" : "rgba(183,78,111,0.05)", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.08)" : "rgba(183,78,111,0.1)"}` }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="text-[10px] ml-1.5 font-mono" style={{ color: dark ? "rgba(244,189,189,0.35)" : "rgba(38,29,36,0.35)" }}>
                    kixa · devnet · live
                  </span>
                </div>
                <div className="p-4 font-mono text-[11px] leading-[2.1]">
                  {LOG_ENTRIES.map((row, i) => (
                    <div key={i} className="flex gap-3.5 transition-all duration-500"
                      style={{ opacity: visibleRows.includes(i) ? 1 : 0, transform: visibleRows.includes(i) ? "translateX(0)" : "translateX(-8px)" }}>
                      <span style={{ color: dark ? "rgba(244,189,189,0.25)" : "rgba(38,29,36,0.3)", minWidth: 52 }}>{row.time}</span>
                      <span className="font-bold min-w-[64px]" style={{ color: row.type === "ok" ? "#4dd49a" : row.type === "bl" ? "#f07070" : "#f0b060" }}>
                        {row.label}
                      </span>
                      <span style={{ color: dark ? "rgba(244,189,189,0.4)" : "rgba(38,29,36,0.45)" }}>{row.detail}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span style={{ color: "rgba(183,78,111,0.5)" }}>kixa $</span>
                    <span className="term-cursor" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-[10px] tracking-[3.5px] uppercase font-medium font-host mb-5" style={{ color: "rgba(183,78,111,0.55)" }}>
                {s.s2Label}
              </div>
              <h2 className="font-archivo text-[34px] leading-[1.1] tracking-[-0.5px] mb-5" style={{ color: dark ? "#f4bdbd" : "#261d24" }}>
                {s.s2Title}<span style={{ color: "#b74e6f" }}>{s.s2Accent}</span>
              </h2>
              <p className="text-[15px] leading-[1.85] font-light font-host" style={{ color: dark ? "rgba(244,189,189,0.45)" : "rgba(38,29,36,0.5)" }}>
                {s.s2Body}
              </p>
            </div>
          </div>
        </section>

        {/* ── TAGLINE ── */}
        <div className="py-24 px-12 text-center" style={{ background: dark ? "#1c1020" : "#ecdae3", borderBottom: `1px solid ${dark ? "rgba(183,78,111,0.07)" : "rgba(183,78,111,0.1)"}` }}>
          <p className="font-archivo text-[26px] leading-[1.5] tracking-[-0.2px] max-w-[580px] mx-auto" style={{ color: dark ? "rgba(244,189,189,0.45)" : "rgba(38,29,36,0.45)" }}>
            "{s.tq[0]} <span style={{ color: "#b74e6f" }}>{s.tq[1]}</span>{s.tq[2]}"
          </p>
        </div>

        {/* ── FOOTER CTA ── */}
        <section className="relative py-24 px-12 text-center overflow-hidden" style={{ background: "#36173d", borderTop: "1px solid rgba(183,78,111,0.15)" }}>
          <canvas ref={fcvRef} className="absolute inset-0 pointer-events-none z-0" />
          <div className="relative z-10">
            <h2 className="font-archivo text-[46px] leading-[1.0] tracking-[-1.5px] mb-3" style={{ color: "#f4bdbd" }}>
              {s.footerTitle}<span style={{ color: "#b74e6f" }}>{s.footerAccent}</span>
            </h2>
            <p className="text-[15px] font-light font-host mb-10" style={{ color: "rgba(244,189,189,0.35)" }}>
              {s.footerSub}
            </p>
            <button onClick={() => setConnected(v => !v)}
              className="px-10 py-4 rounded-full text-[15px] font-semibold font-host transition-all relative overflow-hidden"
              style={{ background: "#b74e6f", color: "#f4bdbd", cursor: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(183,78,111,0.45)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
              {connected ? "Dashboard →" : s.footerCta}
            </button>
          </div>
        </section>

        {/* ── BOTTOM BAR ── */}
        <div className="flex justify-between items-center px-12 py-5" style={{ background: dark ? "#080508" : "#faf0f4", borderTop: `1px solid ${dark ? "rgba(183,78,111,0.06)" : "rgba(183,78,111,0.1)"}` }}>
          <span className="text-[11px] font-light font-host" style={{ color: dark ? "rgba(244,189,189,0.25)" : "rgba(38,29,36,0.3)" }}>
            {s.footerCopy}
          </span>
          <div className="flex gap-6">
            {["Docs", "GitHub", "Privacy"].map(l => (
              <span key={l} className="text-[11px] font-host transition-colors" style={{ color: dark ? "rgba(244,189,189,0.25)" : "rgba(38,29,36,0.3)", cursor: "none" }}>{l}</span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
