"use client";
import { useWallet } from "@solana/wallet-adapter-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { select, connect, wallets } = useWallet();

  if (!isOpen) return null;

  const handleWalletClick = async (walletName: string) => {
    try {
      const wallet = wallets.find(w => w.adapter.name.toLowerCase() === walletName.toLowerCase());
      if (wallet) {
        select(wallet.adapter.name);
        await connect();
        onClose();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const supportedWallets = [
    { name: "Phantom", icon: "👻" },
    { name: "Solflare", icon: "☀️" }
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)"}} onClick={onClose}>
      <div style={{background:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:16,padding:32,width:400,maxWidth:"90vw"}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:24,color:"hsl(var(--foreground))"}}>Connect Wallet</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid hsl(var(--border))",background:"transparent",color:"hsl(var(--muted-foreground))",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:14,color:"hsl(var(--muted-foreground))",marginBottom:24}}>Choose your wallet to connect to KIXA</p>
        
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {supportedWallets.map(wallet => (
            <button
              key={wallet.name}
              onClick={() => handleWalletClick(wallet.name)}
              style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",borderRadius:12,border:"1px solid hsl(var(--border))",background:"hsl(var(--background))",color:"hsl(var(--foreground))",cursor:"pointer",transition:"all 0.2s",fontSize:16,fontWeight:500}}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#b74e6f"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "hsl(var(--border))"}
            >
              <span style={{fontSize:28}}>{wallet.icon}</span>
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
