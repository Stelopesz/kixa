import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/app/lib/rateLimit";
import { supabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  const { data, error } = await supabase.from("activities").select("*").eq("wallet_address", wallet).order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
