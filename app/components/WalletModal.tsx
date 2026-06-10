"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/contexts/I18nContext";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { select, connect, wallets, connected } = useWallet();
  const { t } = useI18n();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (connected) onClose();
  }, [connected]);

  if (!isOpen) return null;

  const installedWallets = wallets.filter(w => w.readyState === WalletReadyState.Installed);
  const notInstalledWallets = wallets.filter(w => w.readyState !== WalletReadyState.Installed);

  const handleWalletClick = async (walletName: string) => {
    try {
      setConnecting(true);
      const wallet = wallets.find(w => w.adapter.name === walletName);
      if (wallet) {
        select(wallet.adapter.name);
        await connect();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:20,padding:32,width:400,maxWidth:"90vw"}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:22,color:"hsl(var(--foreground))"}}>{t("wallet.connect")}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid hsl(var(--border))",background:"transparent",color:"hsl(var(--muted-foreground))",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,color:"hsl(var(--muted-foreground))",marginBottom:24}}>{t("wallet.chooseDesc")}</p>

        {connecting && (
          <p style={{textAlign:"center",color:"hsl(var(--muted-foreground))",fontSize:14,padding:"20px 0"}}>{t("wallet.connecting")}</p>
        )}

        {!connecting && installedWallets.length > 0 && (
          <div style={{marginBottom:20}}>
            <p style={{fontSize:11,fontWeight:600,color:"hsl(var(--muted-foreground))",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{t("wallet.detected")}</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {installedWallets.map(wallet => (
                <button key={wallet.adapter.name} onClick={() => handleWalletClick(wallet.adapter.name)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,border:"2px solid #b74e6f",background:"rgba(183,78,111,0.05)",color:"hsl(var(--foreground))",cursor:"pointer",fontSize:15,fontWeight:600,width:"100%"}}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(183,78,111,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(183,78,111,0.05)"; }}
                >
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} style={{width:28,height:28,borderRadius:6}} onError={(e) => { e.currentTarget.style.display="none"; }} />
                  <span>{wallet.adapter.name}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#22c55e",fontWeight:500}}>● {t("wallet.installed")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!connecting && notInstalledWallets.length > 0 && (
          <div>
            <p style={{fontSize:11,fontWeight:600,color:"hsl(var(--muted-foreground))",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
              {installedWallets.length > 0 ? t("wallet.otherWallets") : t("wallet.availableWallets")}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {notInstalledWallets.map(wallet => (
                <a key={wallet.adapter.name} href={wallet.adapter.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,border:"1px solid hsl(var(--border))",background:"hsl(var(--background))",color:"hsl(var(--muted-foreground))",fontSize:15,fontWeight:500,textDecoration:"none"}}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#b74e6f"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
                >
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} style={{width:28,height:28,borderRadius:6,opacity:0.5}} onError={(e) => { e.currentTarget.style.display="none"; }} />
                  <span>{wallet.adapter.name}</span>
                  <span style={{marginLeft:"auto",fontSize:11,fontWeight:500}}>{t("wallet.install")} →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {!connecting && installedWallets.length === 0 && notInstalledWallets.length === 0 && (
          <p style={{textAlign:"center",color:"hsl(var(--muted-foreground))",fontSize:14,padding:"20px 0"}}>
            {t("wallet.noWallets")}
          </p>
        )}
      </div>
    </div>
  );
}
