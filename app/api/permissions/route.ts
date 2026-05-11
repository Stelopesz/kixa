import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  const { data, error } = await supabase.from("permissions").select("*").eq("wallet_address", wallet).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, agent_id, type, name, description, token, limit, config, expiration } = body;
  if (!wallet_address || !type || !name) return NextResponse.json({ error: "wallet_address, type, name required" }, { status: 400 });
  const { data, error } = await supabase.from("permissions").insert({ wallet_address, agent_id: agent_id || null, type, name, description: description || "", token: token || "SOL", limit: limit || "0", config: config || {}, expiration }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("activities").insert({ wallet_address, agent_id: agent_id || null, permission_id: data.id, type: "created", description: "Permission " + name + " created" });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, wallet_address, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { data, error } = await supabase.from("permissions").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (updates.status === "revoked") { await supabase.from("activities").insert({ wallet_address: wallet_address || "", permission_id: id, type: "revoked", description: "Permission revoked" }); }
  return NextResponse.json(data);
}
