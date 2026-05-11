import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are KIXA's AI Agent Builder. You help users create AI agents on Solana with the right permissions.

When the user describes what they want their agent to do, you must:
1. Understand their goal
2. Suggest an agent name
3. Infer the right permissions automatically

Available permission types:
- spend: Send SOL/tokens to addresses (params: limit, token)
- swap: Exchange tokens on DEX (params: fromToken, toToken, limit)
- perp: Trade perpetual futures (params: limit, token)
- dca: Recurring buys automatically (params: limit, fromToken, toToken, frequency)
- defi: Stake, lend, provide liquidity (params: protocol, limit, token)
- custom: Custom rule (params: description, limit, token)

When you have enough info, respond with a JSON block like this:

\`\`\`json
{
  "agent_name": "DCA Bot",
  "agent_description": "Buys ETH weekly using SOL",
  "agent_type": "dca",
  "permissions": [
    {
      "type": "dca",
      "name": "Weekly DCA",
      "description": "Buy 10 SOL worth of ETH every week",
      "token": "SOL",
      "limit": "10",
      "config": { "fromToken": "SOL", "toToken": "ETH", "frequency": "Weekly" },
      "expiration_days": 90
    }
  ]
}
\`\`\`

Rules:
- Always be friendly and conversational
- Ask clarifying questions if the goal is unclear
- Keep permissions minimal and only what is needed
- Always include expiration_days (default 30)
- If the user confirms, output the final JSON
- Never add permissions the user did not ask for`;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }
  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "Anthropic API error: " + err }, { status: 500 });
    }
    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    let agentConfig = null;
    const jsonMatch = text.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
    if (jsonMatch) {
      try { agentConfig = JSON.parse(jsonMatch[1]); } catch {}
    }
    return NextResponse.json({ message: text, agentConfig });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
