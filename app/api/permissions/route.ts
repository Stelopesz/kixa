import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/app/lib/rateLimit";
import { supabase } from "@/app/lib/supabase";
import { isValidSolanaWallet } from "@/app/lib/solana";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  if (!isValidSolanaWallet(wallet)) return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  const { data, error } = await supabase.from("permissions").select("*").eq("wallet_address", wallet).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json();
  const { wallet_address, agent_id, type, name, description, token, limit, config, expiration } = body;
  if (!wallet_address || !type || !name) return NextResponse.json({ error: "wallet_address, type, name required" }, { status: 400 });
  if (!isValidSolanaWallet(wallet_address)) return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  const { data, error } = await supabase.from("permissions").insert({ wallet_address, agent_id: agent_id || null, type, name, description: description || "", token: token || "SOL", limit: limit || "0", config: config || {}, expiration }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("activities").insert({ wallet_address, agent_id: agent_id || null, permission_id: data.id, type: "created", description: "Permission " + name + " created" });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, wallet_address, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!wallet_address) return NextResponse.json({ error: "wallet_address required" }, { status: 400 });
  if (!isValidSolanaWallet(wallet_address)) return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  const { data: existing } = await supabase.from("permissions").select("wallet_address").eq("id", id).single();
  if (!existing || existing.wallet_address !== wallet_address) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await supabase.from("permissions").update(updates).eq("id", id).eq("wallet_address", wallet_address).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (updates.status === "revoked") { await supabase.from("activities").insert({ wallet_address, permission_id: id, type: "revoked", description: "Permission revoked" }); }
  return NextResponse.json(data);
}
