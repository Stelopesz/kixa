"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Clock, Shield } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useAgents } from "@/app/hooks/useAgents";
import { useI18n } from "@/app/contexts/I18nContext";

export default function AgentsPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { agents, isLoading } = useAgents(publicKey || undefined);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!connected) {
    return (
      <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",gap:16,alignItems:"center",justifyContent:"center"}}>
        <p style={{color:"hsl(var(--muted-foreground))"}}>{t("wallet.connecting")}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:28,marginBottom:8}}>{t("dashboard.yourAgents")}</h1>
          <p style={{fontSize:14,color:"hsl(var(--muted-foreground))"}}>{t("agents.subtitle")}</p>
        </div>
        <button
          onClick={() => router.push("/agent/create")}
          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:14}}
        >
          <Plus size={16} />
          {t("agents.create")}
        </button>
      </div>

      {isLoading ? (
        <div style={{padding:40,textAlign:"center",color:"hsl(var(--muted-foreground))"}}>
          {t("agents.loading")}
        </div>
      ) : agents.length === 0 ? (
        <div style={{padding:60,textAlign:"center",background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:16}}>
          <Bot size={48} style={{margin:"0 auto 16px",color:"hsl(var(--muted-foreground))",opacity:0.5}} />
          <h3 style={{fontSize:18,fontWeight:600,marginBottom:8}}>{t("agents.empty")}</h3>
          <p style={{color:"hsl(var(--muted-foreground))",marginBottom:20}}>{t("agents.emptyDesc")}</p>
          <button
            onClick={() => router.push("/agent/create")}
            style={{padding:"10px 24px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}
          >
            {t("agents.createFirst")}
          </button>
        </div>
      ) : (
        <div style={{display:"grid",gap:16}}>
          {agents.map((agent: any) => (
            <div
              key={agent.id}
              onClick={() => router.push(`/agents/${agent.id}`)}
              className="stat-card"
              style={{ padding:20, cursor:"pointer" }}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(183,78,111,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Bot size={20} style={{color:"#b74e6f"}} />
                  </div>
                  <div>
                    <h3 style={{fontSize:16,fontWeight:600,marginBottom:2}}>{agent.name}</h3>
                    <p style={{fontSize:13,color:"hsl(var(--muted-foreground))"}}>{agent.description || t("dashboard.noDesc")}</p>
                  </div>
                </div>
                <span style={{
                  padding:"4px 10px",
                  borderRadius:6,
                  fontSize:11,
                  fontWeight:600,
                  background: agent.status === 'active' ? "rgba(34,197,94,0.1)" : "rgba(148,163,184,0.1)",
                  color: agent.status === 'active' ? "#22c55e" : "#94a3b8"
                }}>
                  {agent.status === 'active' ? t("status.active").toUpperCase() : t("agent.status.paused").toUpperCase()}
                </span>
              </div>

              <div style={{display:"flex",gap:20,fontSize:12,color:"hsl(var(--muted-foreground))"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Shield size={14} />
                  <span>{agent.permissions?.length || 0} {t("dashboard.permCount")}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Clock size={14} />
                  <span>{t("card.createdAt")} {new Date(agent.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
