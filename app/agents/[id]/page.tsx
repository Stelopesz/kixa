"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Shield, Play, Pause, Trash2 } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { toast } from "sonner";

export default function AgentDetailPage() {
  const router = useRouter();
  const id = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : null;
  const { publicKey } = useWallet();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id || !publicKey) return;
    fetch(`/api/agents?wallet=${publicKey}`)
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find((a: any) => a.id === id) : null;
        setAgent(found);
        setLoading(false);
      });
  }, [id, publicKey]);

  const handleDelete = async () => {
    await fetch(`/api/agents?id=${agent.id}`, { method: "DELETE" });
    toast.success("Agent deleted successfully");
    router.push("/agents");
  };

  if (loading) return <div style={{padding:40,textAlign:"center"}}>Loading agent...</div>;

  if (!agent) return (
    <div style={{padding:40,textAlign:"center"}}>
      <p style={{marginBottom:16}}>Agent not found</p>
      <button onClick={()=>router.push("/agents")} style={{padding:"10px 20px",borderRadius:10,background:"#b74e6f",color:"#fff",border:"none",cursor:"pointer"}}>Back to Agents</button>
    </div>
  );

  return (
    <div>
      {showDeleteModal && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.70)",backdropFilter:"blur(6px)"}} onClick={()=>setShowDeleteModal(false)} />
          <div style={{position:"relative",width:"100%",maxWidth:440,padding:"32px 28px",borderRadius:20,background:"hsl(var(--background))",boxShadow:"0 8px 30px rgba(0,0,0,0.1)",border:"1px solid hsl(var(--border) / 0.6)"}}>
            <h3 style={{fontSize:20,fontWeight:800,marginBottom:12,fontFamily:"'Archivo Black',sans-serif"}}>Delete Agent</h3>
            <p style={{fontSize:14,color:"hsl(var(--muted-foreground))",marginBottom:28,lineHeight:1.6}}>Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone.</p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowDeleteModal(false)} style={{padding:"10px 20px",borderRadius:12,background:"transparent",border:"1px solid hsl(var(--border))",cursor:"pointer",fontSize:14,fontWeight:600,color:"hsl(var(--foreground))"}}>Cancel</button>
              <button onClick={handleDelete} style={{padding:"10px 20px",borderRadius:12,background:"#ef4444",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:"#fff"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={()=>router.push("/agents")} style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,padding:"8px 12px",borderRadius:8,background:"transparent",border:"1px solid hsl(var(--border))",color:"hsl(var(--foreground))",cursor:"pointer",fontSize:14}}>
        <ArrowLeft size={16} />
        Back to Agents
      </button>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(183,78,111,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Bot size={28} style={{color:"#b74e6f"}} />
          </div>
          <div>
            <h1 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:28,marginBottom:4}}>{agent.name}</h1>
            <p style={{fontSize:14,color:"hsl(var(--muted-foreground))"}}>{agent.description || "No description"}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={async()=>{const s=agent.status==="active"?"paused":"active";await fetch("/api/agents",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:agent.id,status:s})});setAgent({...agent,status:s});}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:agent.status==="active"?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",color:agent.status==="active"?"#ef4444":"#22c55e",border:"none",cursor:"pointer",fontWeight:600}}>
            {agent.status === "active" ? <><Pause size={16} />Pause</> : <><Play size={16} />Resume</>}
          </button>
          <button onClick={()=>setShowDeleteModal(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,background:"rgba(183,78,111,0.1)",color:"#b74e6f",border:"none",cursor:"pointer",fontWeight:600}}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={{display:"grid",gap:20}}>
        <div className="stat-card" style={{padding:24}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <Shield size={18} style={{color:"#b74e6f"}} />
            Permissions
          </h3>
          {(agent.permissions||[]).length===0 ? (
            <p style={{fontSize:14,color:"hsl(var(--muted-foreground))"}}>No permissions</p>
          ) : (agent.permissions||[]).map((p:any) => (
            <div key={p.id} style={{padding:12,background:"hsl(var(--background))",border:"1px solid hsl(var(--border))",borderRadius:10,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontWeight:600,fontSize:14,margin:"0 0 2px"}}>{p.name}</p>
                <p style={{fontSize:12,color:"hsl(var(--muted-foreground))",margin:0}}>{p.type} · {p.limit} {p.token}</p>
              </div>
              <span style={{fontSize:12,padding:"4px 10px",borderRadius:20,background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.2)",fontWeight:500,display:"inline-flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
                {p.status||"Active"}
              </span>
            </div>
          ))}
        </div>

        <div className="stat-card" style={{padding:24}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Agent Details</h3>
          <div style={{display:"grid",gap:12,fontSize:14}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"hsl(var(--muted-foreground))"}}>Type:</span>
              <span style={{fontWeight:500}}>{agent.agent_type || "custom"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"hsl(var(--muted-foreground))"}}>Status:</span>
              <span style={{fontWeight:500}}>{agent.status}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"hsl(var(--muted-foreground))"}}>Created:</span>
              <span style={{fontWeight:500}}>{new Date(agent.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
