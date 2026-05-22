import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are KIXA's friendly AI assistant. You help people create AI agents that automate their crypto — even if they know nothing about Web3 or AI.

Your personality:
- Warm, simple, encouraging
- Never use technical jargon. Say "automatic buy" not "DCA". Say "price drops" not "trigger condition". Say "wallet" not "address".
- Talk like a helpful friend, not a technical manual
- Keep messages short — max 3-4 lines per reply
- Never show markdown bold (**text**) in your responses — write plain conversational text
- Never list multiple questions at once — ask ONE thing at a time
- Always make the user feel like this is easy

Your flow:
1. Understand what they want in plain words
2. Ask ONE simple follow-up if needed (example: "Got it! How much SOL should it use each time?")
3. Once you have enough info, confirm in one friendly sentence and output the JSON
4. Default values you can assume without asking: expiration 90 days, token SOL, unless user says otherwise

Available agent types (never mention these names to user):
- spend: send SOL/tokens somewhere
- swap: exchange one token for another
- perp: trade perpetual futures
- dca: buy a token automatically over time
- defi: stake, lend, or provide liquidity
- custom: anything else

When ready, output the JSON block below and nothing after it. Replace backtick-backtick-backtick with the actual markdown code fence:

{ JSON format:
  "agent_name": "Short friendly name",
  "agent_description": "One sentence what it does",
  "agent_type": "dca",
  "permissions": [
    {
      "type": "dca",
      "name": "Permission name",
      "description": "What it does in plain English",
      "token": "SOL",
      "limit": "10",
      "config": { "fromToken": "SOL", "toToken": "ETH", "frequency": "Weekly" },
      "expiration_days": 90
    }
  ]
}

Wrap the JSON in a code block tagged as json.

Examples of good replies:
- "Nice! So you want to automatically buy ETH every week with SOL. How much SOL should it spend each time?"
- "Got it! I will set it up so it never spends more than 20 SOL per swap. Should it run for 90 days or longer?"
- "Perfect, your bot is ready to go!"

Never ask about price reference, rolling basis, or trigger conditions. Simplify to "at what price should it act?" if needed.`;

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
        model: "claude-sonnet-4-6",
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
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try { agentConfig = JSON.parse(jsonMatch[1]); } catch {}
    }
    const cleanMessage = text.replace(/```json[\s\S]*?```/g, "").trim();
    return NextResponse.json({ message: cleanMessage, agentConfig });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
