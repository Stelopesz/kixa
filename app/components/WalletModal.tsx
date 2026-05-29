"use client";
import { useEffect, useState } from "react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  { name: "Phantom", icon: "https://phantom.app/img/phantom-logo.png", url: "https://phantom.app/", checkKey: "phantom" },
  { name: "Solflare", icon: "https://solflare.com/assets/logo.svg", url: "https://solflare.com/", checkKey: "solflare" },
];

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [installed, setInstalled] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const found: string[] = [];
    if ((window as any).phantom?.solana) found.push("phantom");
    if ((window as any).solflare) found.push("solflare");
    setInstalled(found);
  }, [isOpen]);

  if (!isOpen) return null;

  const installedWallets = WALLETS.filter(w => installed.includes(w.checkKey));
  const notInstalledWallets = WALLETS.filter(w => !installed.includes(w.checkKey));

  const handleConnect = async (walletKey: string) => {
    try {
      if (walletKey === "phantom" && (window as any).phantom?.solana) {
        await (window as any).phantom.solana.connect();
        onClose();
      } else if (walletKey === "solflare" && (window as any).solflare) {
        await (window as any).solflare.connect();
        onClose();
      }
    } catch (e) {
      console.error("Wallet connection error:", e);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:20,padding:32,width:400,maxWidth:"90vw"}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:22,color:"hsl(var(--foreground))"}}>Connect Wallet</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid hsl(var(--border))",background:"transparent",color:"hsl(var(--muted-foreground))",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,color:"hsl(var(--muted-foreground))",marginBottom:24}}>Choose your wallet to connect to KIXA</p>

        {installedWallets.length > 0 && (
          <div style={{marginBottom:20}}>
            <p style={{fontSize:11,fontWeight:600,color:"hsl(var(--muted-foreground))",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Detected</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {installedWallets.map(wallet => (
                <button key={wallet.name} onClick={() => handleConnect(wallet.checkKey)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,border:"2px solid #b74e6f",background:"rgba(183,78,111,0.05)",color:"hsl(var(--foreground))",cursor:"pointer",fontSize:15,fontWeight:600,width:"100%"}}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(183,78,111,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(183,78,111,0.05)"; }}
                >
                  <img src={wallet.icon} alt={wallet.name} style={{width:28,height:28,borderRadius:6}} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span>{wallet.name}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#22c55e",fontWeight:500}}>● Installed</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {notInstalledWallets.length > 0 && (
          <div>
            <p style={{fontSize:11,fontWeight:600,color:"hsl(var(--muted-foreground))",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
              {installedWallets.length > 0 ? "Other wallets" : "Available wallets"}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {notInstalledWallets.map(wallet => (
                <a key={wallet.name} href={wallet.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,border:"1px solid hsl(var(--border))",background:"hsl(var(--background))",color:"hsl(var(--muted-foreground))",fontSize:15,fontWeight:500,textDecoration:"none"}}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#b74e6f"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
                >
                  <img src={wallet.icon} alt={wallet.name} style={{width:28,height:28,borderRadius:6,opacity:0.5}} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span>{wallet.name}</span>
                  <span style={{marginLeft:"auto",fontSize:11,fontWeight:500}}>Install →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
