"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import OnboardingTutorial, { OnboardingTutorialHandle } from "@/app/components/OnboardingTutorial";
import { useRef } from "react";
import { LayoutDashboard, Shield, Bot, Activity, User, Sun, Moon, HelpCircle, Globe, ChevronDown, LogOut } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useI18n } from "@/app/contexts/I18nContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { connected, shortAddress, disconnect } = useWallet();
  const { t, locale, setLocale } = useI18n();
  const [isDark, setIsDark] = useState(() => { if (typeof window !== "undefined") { return localStorage.getItem("kixa-theme") === "dark"; } return false; });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tutorialRef = useRef<OnboardingTutorialHandle>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("kixa-theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("nav.overview") },
    { href: "/permissions", icon: Shield, label: t("nav.permissions") },
    { href: "/agents", icon: Bot, label: t("nav.agent") },
    { href: "/activity", icon: Activity, label: t("nav.activity") },
    { href: "/profile", icon: User, label: t("nav.profile") }
  ];

  const active = (href: string) => pathname === href || (href === "/agents" && pathname.startsWith("/agents"));

  if (!mounted) return null;

  if (!connected) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <p style={{marginBottom:16,color:"hsl(var(--muted-foreground))"}}>Connecting wallet...</p>
          <button onClick={()=>router.push("/")} style={{padding:"10px 24px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer"}}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .kx-layout{display:flex;min-height:100vh;background:hsl(var(--background))}
        .kx-sidebar{width:240px;border-right:1px solid hsl(var(--border));padding:24px 16px;display:flex;flex-direction:column;height:100vh;position:sticky;top:0;flex-shrink:0}
        .kx-main{flex:1;overflow:auto}
        .kx-main-inner{max-width:896px;margin:0 auto;padding:40px 32px}
        .kx-mheader{display:none}
        .kx-bnav{display:none}
        @media(max-width:768px){
          .kx-sidebar{display:none}
          .kx-main-inner{padding:16px 16px 100px}
          .kx-mheader{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid hsl(var(--border));background:hsl(var(--background));position:sticky;top:0;z-index:50}
          .kx-bnav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:100;background:hsl(var(--background));border-top:1px solid hsl(var(--border));padding:8px 0 20px;justify-content:space-around;align-items:center}
          .kx-bitem{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 8px;text-decoration:none;font-size:10px;font-weight:500;color:hsl(var(--muted-foreground));background:transparent;border:none;cursor:pointer}
          .kx-bitem.on{color:#b74e6f}
        }
      `}</style>
      <div className="kx-layout">
        <aside className="kx-sidebar">
          <div style={{marginBottom:32}}>
            <Link href="/dashboard" style={{textDecoration:"none"}}>
              <img src={isDark?"/kixa-logo-dark.svg":"/kixa-logo-light.svg"} alt="KIXA" style={{height:36}} />
            </Link>
            <p style={{fontSize:11,color:"hsl(var(--muted-foreground))",marginTop:6}}>AI moves fast.<br/>Your rules move first.</p>
          </div>
          <nav style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
            {navItems.map(({href,icon:Icon,label})=>(
              <Link key={href} href={href} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,textDecoration:"none",color:active(href)?"#b74e6f":"hsl(var(--muted-foreground))",background:active(href)?"rgba(183,78,111,0.1)":"transparent",fontWeight:active(href)?600:400,fontSize:14,transition:"all 0.2s"}}>
                <Icon size={18}/>{label}
              </Link>
            ))}
          </nav>
          <div style={{display:"flex",flexDirection:"column",gap:4,paddingTop:16,borderTop:"1px solid hsl(var(--border))"}}>
            <button onClick={()=>setIsDark(!isDark)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",fontSize:14,cursor:"pointer",width:"100%",fontFamily:"inherit"}}>
              {isDark?<Sun size={18}/>:<Moon size={18}/>}{isDark?"Light mode":"Dark mode"}
            </button>
            <button onClick={()=>tutorialRef.current?.open()} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",fontSize:14,cursor:"pointer",width:"100%",fontFamily:"inherit"}}>
              <HelpCircle size={18}/>{t("nav.quickGuide")}
            </button>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowLangMenu(!showLangMenu)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",fontSize:14,cursor:"pointer",width:"100%",fontFamily:"inherit"}}>
                <span style={{display:"flex",alignItems:"center",gap:12}}><Globe size={18}/>{locale==="en"?"English":locale==="pt"?"Português":"Español"}</span>
                <ChevronDown size={14}/>
              </button>
              {showLangMenu&&(
                <div style={{position:"absolute",bottom:"100%",left:0,right:0,marginBottom:4,background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:8,overflow:"hidden",zIndex:50}}>
                  {[{code:"en",name:"English"},{code:"pt",name:"Português"},{code:"es",name:"Español"}].map(l=>(
                    <button key={l.code} onClick={()=>{setLocale(l.code as any);setShowLangMenu(false);}} style={{display:"block",width:"100%",padding:"8px 12px",background:locale===l.code?"rgba(183,78,111,0.1)":"transparent",border:"none",color:locale===l.code?"#b74e6f":"hsl(var(--foreground))",fontSize:13,cursor:"pointer",textAlign:"left"}}>{l.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{marginTop:16,padding:"10px 12px",background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/><span style={{fontSize:12,fontFamily:"monospace"}}>{shortAddress}</span></span>
            <button onClick={()=>{disconnect();setTimeout(()=>router.push("/"),100);}} style={{padding:0,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",cursor:"pointer"}}><LogOut size={14}/></button>
          </div>
          </aside>
        <OnboardingTutorial ref={tutorialRef}/>
        <main className="kx-main">
          <div className="kx-mheader">
            <Link href="/dashboard" style={{textDecoration:"none"}}><img src={isDark?"/kixa-logo-dark.svg":"/kixa-logo-light.svg"} alt="KIXA" style={{height:28}}/></Link>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <button onClick={()=>setIsDark(!isDark)} style={{padding:8,borderRadius:8,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",cursor:"pointer"}}>{isDark?<Sun size={18}/>:<Moon size={18}/>}</button>
              <div style={{position:"relative"}}>
                <button onClick={()=>setShowLangMenu(!showLangMenu)} style={{padding:8,borderRadius:8,background:"transparent",border:"none",color:"hsl(var(--muted-foreground))",cursor:"pointer"}}><Globe size={18}/></button>
                {showLangMenu&&(
                  <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:8,overflow:"hidden",zIndex:50,minWidth:120}}>
                    {[{code:"en",name:"English"},{code:"pt",name:"Português"},{code:"es",name:"Español"}].map(l=>(
                      <button key={l.code} onClick={()=>{setLocale(l.code as any);setShowLangMenu(false);}} style={{display:"block",width:"100%",padding:"8px 12px",background:locale===l.code?"rgba(183,78,111,0.1)":"transparent",border:"none",color:locale===l.code?"#b74e6f":"hsl(var(--foreground))",fontSize:13,cursor:"pointer",textAlign:"left"}}>{l.name}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="kx-main-inner">{children}</div>
        </main>
        <nav className="kx-bnav">
          {navItems.map(({href,icon:Icon,label})=>(
            <Link key={href} href={href} className={`kx-bitem${active(href)?" on":""}`}>
              <Icon size={22}/>{label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
