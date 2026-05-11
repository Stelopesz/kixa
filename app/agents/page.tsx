"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Clock, Shield } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useAgents } from "@/app/hooks/useAgents";

export default function AgentsPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { agents, isLoading } = useAgents(publicKey || undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    console.log("Agents data:", { connected, publicKey, agents, isLoading });
  }, [connected, publicKey, agents, isLoading]);

  if (!mounted) return null;

  if (!connected) {
    return (
      <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",gap:16,alignItems:"center",justifyContent:"center"}}>
        <p style={{color:"hsl(var(--muted-foreground))"}}>Connecting wallet...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:28,marginBottom:8}}>Your Agents</h1>
          <p style={{fontSize:14,color:"hsl(var(--muted-foreground))"}}>Manage your AI agents and permissions</p>
        </div>
        <button 
          onClick={() => router.push("/agent/create")}
          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:14}}
        >
          <Plus size={16} />
          Create Agent
        </button>
      </div>

      {isLoading ? (
        <div style={{padding:40,textAlign:"center",color:"hsl(var(--muted-foreground))"}}>
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div style={{padding:60,textAlign:"center",background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:16}}>
          <Bot size={48} style={{margin:"0 auto 16px",color:"hsl(var(--muted-foreground))",opacity:0.5}} />
          <h3 style={{fontSize:18,fontWeight:600,marginBottom:8}}>No agents yet</h3>
          <p style={{color:"hsl(var(--muted-foreground))",marginBottom:20}}>Create your first AI agent to get started</p>
          <button 
            onClick={() => router.push("/agent/create")}
            style={{padding:"10px 24px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}
          >
            Create First Agent
          </button>
        </div>
      ) : (
        <div style={{display:"grid",gap:16}}>
          {agents.map((agent: any) => (
            <div 
              key={agent.id}
              onClick={() => router.push(`/agents/${agent.id}`)}
              style={{
                padding:20,
                background:"hsl(var(--card))",
                border:"1px solid hsl(var(--border))",
                borderRadius:16,
                cursor:"pointer",
                transition:"all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#b74e6f";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(183,78,111,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Bot size={20} style={{color:"#b74e6f"}} />
                  </div>
                  <div>
                    <h3 style={{fontSize:16,fontWeight:600,marginBottom:2}}>{agent.name}</h3>
                    <p style={{fontSize:13,color:"hsl(var(--muted-foreground))"}}>{agent.description || "No description"}</p>
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
                  {agent.status?.toUpperCase()}
                </span>
              </div>

              <div style={{display:"flex",gap:20,fontSize:12,color:"hsl(var(--muted-foreground))"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Shield size={14} />
                  <span>{agent.permissions?.length || 0} permissions</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Clock size={14} />
                  <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
