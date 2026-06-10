"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Clock, Zap, Map, Eye, Sun, Moon, Brain, Sparkles } from "lucide-react";
import { useI18n } from "@/app/contexts/I18nContext";
import LanguageDropdown from "@/app/components/LanguageDropdown";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DocsPage() {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("kixa-theme");
    const d = savedTheme === "dark";
    setDark(d);
    setIsDark(d);
    document.documentElement.classList.toggle("dark", d);
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

  const sections = [
    { id: "what", icon: Shield, labelKey: "docs.s.what" },
    { id: "how", icon: Zap, labelKey: "docs.s.how" },
    { id: "quickperm", icon: Shield, labelKey: "docs.s.quickperm" },
    { id: "agentbuilder", icon: Brain, labelKey: "docs.s.agentbuilder" },
    { id: "types", icon: Lock, labelKey: "docs.s.types" },
    { id: "security", icon: Lock, labelKey: "docs.s.security" },
    { id: "activity", icon: Clock, labelKey: "docs.s.activity" },
    { id: "solana", icon: Zap, labelKey: "docs.s.solana" },
    { id: "roadmap", icon: Map, labelKey: "docs.s.roadmap" },
    { id: "vision", icon: Eye, labelKey: "docs.s.vision" },
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
          <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">{t("docs.header.docs")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <LanguageDropdown />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-16 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "pulse-soft 2s ease-in-out infinite" }} />
            <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{t("docs.badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: "'Archivo Black',sans-serif" }}>
            {(() => { const [pre, post] = t("docs.title").split("KIXA"); return <>{pre}<span className="text-primary">KIXA</span>{post}</>; })()}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            {t("docs.desc")}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass-card rounded-2xl p-8 mb-16 animate-in-delay-1">
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-6">{t("docs.contents")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map(({ id, icon: Icon, labelKey }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-left group">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-16">

          <Section id="what" icon={Shield} title={t("docs.what.title")}>
            <p>{t("docs.what.p1")}</p>
            <p className="mt-3">{t("docs.what.p2")}</p>
            <p className="mt-3">{t("docs.what.p3")}</p>
          </Section>

          <Section id="how" icon={Zap} title={t("docs.how.title")}>
            <p>{t("docs.how.intro")}</p>
            <div className="mt-4 space-y-3">
              {[
                { n: "1", titleKey: "docs.how.s1.title", descKey: "docs.how.s1.desc" },
                { n: "2", titleKey: "docs.how.s2.title", descKey: "docs.how.s2.desc" },
                { n: "3", titleKey: "docs.how.s3.title", descKey: "docs.how.s3.desc" },
              ].map(({ n, titleKey, descKey }) => (
                <div key={n} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t(titleKey)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="quickperm" icon={Shield} title={t("docs.quickperm.title")}>
            <p>{t("docs.quickperm.intro")}</p>
            <div className="mt-4 space-y-2">
              {["docs.quickperm.s1","docs.quickperm.s2","docs.quickperm.s3","docs.quickperm.s4","docs.quickperm.s5"].map((key, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("docs.quickperm.note")}</p>
          </Section>

          <Section id="agentbuilder" icon={Brain} title={t("docs.agentbuilder.title")}>
            <p>{t("docs.agentbuilder.intro")}</p>
            <div className="mt-4 glass-card rounded-2xl p-6 space-y-4">
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm max-w-[300px]">
                  {t("docs.agentbuilder.msg")}
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm">
                  {t("docs.agentbuilder.reply")}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("docs.agentbuilder.note")}</p>
          </Section>

          <Section id="types" icon={Lock} title={t("docs.types.title")}>
            <div className="space-y-2">
              {[
                { typeKey: "docs.types.spend", descKey: "docs.types.spendDesc" },
                { typeKey: "docs.types.mint", descKey: "docs.types.mintDesc" },
                { typeKey: "docs.types.transfer", descKey: "docs.types.transferDesc" },
                { typeKey: "docs.types.swap", descKey: "docs.types.swapDesc" },
                { typeKey: "docs.types.timeBased", descKey: "docs.types.timeBasedDesc" },
                { typeKey: "docs.types.whitelist", descKey: "docs.types.whitelistDesc" },
                { typeKey: "docs.types.custom", descKey: "docs.types.customDesc" },
              ].map(({ typeKey, descKey }) => (
                <div key={typeKey} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-sm font-bold text-primary min-w-[100px] shrink-0">{t(typeKey)}</span>
                  <span className="text-sm text-muted-foreground">{t(descKey)}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="security" icon={Lock} title={t("docs.security.title")}>
            <p>{t("docs.security.p1")}</p>
            <p className="mt-3">{t("docs.security.p2")}</p>
            <div className="mt-4 space-y-2">
              {["docs.security.c1","docs.security.c2","docs.security.c3","docs.security.c4"].map((key, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("docs.security.note")}</p>
          </Section>

          <Section id="activity" icon={Clock} title={t("docs.activity.title")}>
            <p>{t("docs.activity.intro")}</p>
            <div className="mt-4 space-y-2">
              {[
                { key: "docs.activity.l1", color: "bg-green-500" },
                { key: "docs.activity.l2", color: "bg-primary" },
                { key: "docs.activity.l3", color: "bg-red-500" },
                { key: "docs.activity.l4", color: "bg-muted-foreground" },
              ].map(({ key, color }) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                  <span className="text-sm text-muted-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("docs.activity.note")}</p>
          </Section>

          <Section id="solana" icon={Zap} title={t("docs.solana.title")}>
            <p>{t("docs.solana.intro")}</p>
            <div className="mt-4 space-y-3">
              {[
                { titleKey: "docs.solana.speed", descKey: "docs.solana.speedDesc" },
                { titleKey: "docs.solana.cost", descKey: "docs.solana.costDesc" },
                { titleKey: "docs.solana.ecosystem", descKey: "docs.solana.ecosystemDesc" },
              ].map(({ titleKey, descKey }) => (
                <div key={titleKey} className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-sm font-bold">{t(titleKey)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t(descKey)}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="roadmap" icon={Map} title={t("docs.roadmap.title")}>
            <div className="space-y-3">
              {[
                { phaseKey: "docs.roadmap.p1.phase", status: "✅", descKey: "docs.roadmap.p1.desc" },
                { phaseKey: "docs.roadmap.p2.phase", status: "🔄", descKey: "docs.roadmap.p2.desc" },
                { phaseKey: "docs.roadmap.p3.phase", status: "📋", descKey: "docs.roadmap.p3.desc" },
                { phaseKey: "docs.roadmap.p4.phase", status: "🔮", descKey: "docs.roadmap.p4.desc" },
              ].map(({ phaseKey, status, descKey }) => (
                <div key={phaseKey} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-lg">{status}</span>
                  <div>
                    <p className="text-sm font-bold text-primary">{t(phaseKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="vision" icon={Eye} title={t("docs.vision.title")}>
            <p>{t("docs.vision.p1")}</p>
            <p className="mt-3">{t("docs.vision.p2")}</p>
            <p className="mt-3">{t("docs.vision.p3")}</p>
          </Section>

        </div>

        {/* Back to top */}
        <div className="mt-20 text-center">
          <button onClick={() => { document.documentElement.scrollTo({ top: 0, behavior: "smooth" }); document.body.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all">
            {t("docs.backToTop")}
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
