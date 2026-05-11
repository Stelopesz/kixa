"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";

export interface Permission {
  id: string;
  name: string;
  description: string;
  type: string;
  token: string;
  limit: string;
  expiration: Date;
  createdAt: Date;
  status: "active" | "expiring" | "expired" | "revoked";
  agent: string;
  agentName: string;
  agent_id: string;
  walletAddress: string;
  hash: string;
}

export interface Activity {
  id: string;
  type: string;
  permissionId: string;
  description: string;
  timestamp: Date;
  status: "success" | "failed" | "pending";
}

interface PermissionContextType {
  permissions: Permission[];
  activities: Activity[];
  loading: boolean;
  addPermission: (permission: Permission) => void;
  revokePermission: (id: string) => void;
  renewPermission: (id: string, newExpiration: Date) => void;
  refresh: () => void;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  activities: [],
  loading: false,
  addPermission: () => {},
  revokePermission: () => {},
  renewPermission: () => {},
  refresh: () => {}
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const [permsRes, actsRes] = await Promise.all([
        fetch("/api/permissions?wallet=" + publicKey),
        fetch("/api/activities?wallet=" + publicKey)
      ]);
      const permsData = await permsRes.json();
      const actsData = await actsRes.json();

      if (Array.isArray(permsData)) {
        setPermissions(permsData.map((p) => ({
          id: p.id,
          name: p.name || p.type,
          description: p.description || "",
          type: p.type,
          token: p.token || "SOL",
          limit: p.limit || "0",
          expiration: new Date(p.expiration),
          createdAt: new Date(p.created_at),
          status: p.status || "active",
          agent: p.agent_id || "KIXA Agent",
          agentName: p.agent_id || "KIXA Agent",
          agent_id: p.agent_id,
          walletAddress: p.wallet_address,
          hash: p.id
        })));
      }

      if (Array.isArray(actsData)) {
        setActivities(actsData.map((a) => ({
          id: a.id,
          type: a.type,
          permissionId: a.permission_id || "",
          description: a.description || "",
          timestamp: new Date(a.created_at),
          status: "success"
        })));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [publicKey]);

  const addPermission = (permission: Permission) => {
    setPermissions(prev => [...prev, permission]);
  };

  const revokePermission = async (id: string) => {
    await fetch("/api/permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "revoked" })
    });
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, status: "revoked" } : p));
  };

  const renewPermission = (id: string, newExpiration: Date) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, expiration: newExpiration, status: "active" } : p));
  };

  return (
    <PermissionContext.Provider value={{ permissions, activities, loading, addPermission, revokePermission, renewPermission, refresh: fetchData }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
