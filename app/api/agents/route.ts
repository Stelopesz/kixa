import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  const { data, error } = await supabase.from("agents").select("*, permissions(*)").eq("wallet_address", wallet).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, name, description, agent_type, config } = body;
  if (!wallet_address || !name) return NextResponse.json({ error: "wallet_address and name required" }, { status: 400 });
  await supabase.from("users").upsert({ wallet_address }, { onConflict: "wallet_address" });
  const { data: user } = await supabase.from("users").select("id").eq("wallet_address", wallet_address).single();
  const { data, error } = await supabase.from("agents").insert({ user_id: user?.id, wallet_address, name, description: description || "", agent_type: agent_type || "custom", config: config || {} }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("activities").insert({ wallet_address, agent_id: data.id, type: "created", description: "Agent " + name + " created" });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("agents").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
