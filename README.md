# KIXA — AI Permission Protocol on Solana

**Your agent, your rules.**

KIXA is an on-chain permission protocol that lets you create, manage, and revoke what AI agents can do with your Solana wallet — without writing code.

🌐 **Live:** https://kixa.vercel.app
📦 **GitHub:** https://github.com/Stelopesz/kixa

---

## The Problem

AI agents are increasingly managing crypto wallets. But there's no standard way to define **what an agent can and cannot do** — no spending limits, no expiration dates, no audit trail. Users either give full wallet access or nothing.

## The Solution

KIXA lets you:
- Define granular permissions (spend limits, swap caps, DCA rules)
- Set expiration dates on every permission
- Revoke access instantly
- Use the **AI Builder** to create agents in plain English
- Send funds **privately** via Cloak Protocol (ZK shielded pool)

---

## How Cloak is Used

KIXA integrates the **Cloak SDK** (`@cloak.dev/sdk`) for private transfers on Solana:

- **Private transfers:** AI agents execute payments without exposing amounts or addresses on-chain
- **Viewing keys:** Users generate audit keys to share with accountants or regulators — proving transactions without public exposure
- **ZK proofs:** Groth16 proofs generated client-side via the Cloak shielded UTXO pool

The `/private` route in KIXA enables shielded SOL transfers powered by Cloak, with viewing key generation for selective disclosure.

---

## Smart Contract

- **Program ID:** `2dss4aR8pXV9dJP5Y3dL2ZVcL3W4NWNynCMfLojmVPLx`
- **IDL Account:** `CijynLJ7ufAC6ymBerbSxUtvhTehrBE7TPrUtcQsWeQm`
- **Network:** Solana Devnet
- **Source:** `/contracts/kira_permissions`

### Fees
- `0.01 SOL` — grant permission to existing agent
- `0.05 SOL` — create new agent with permissions

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Blockchain:** Solana, Anchor Framework
- **Privacy:** Cloak Protocol SDK
- **AI:** Claude Sonnet (Anthropic) via API
- **Database:** Supabase (PostgreSQL)
- **Auth:** Phantom Wallet

---

## Setup

\`\`\`bash
git clone https://github.com/Stelopesz/kixa
cd kixa
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
\`\`\`

### Environment Variables

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
\`\`\`

---

## Features

- ✅ Connect Phantom wallet
- ✅ Create AI agents via natural language (AI Builder)
- ✅ Grant/revoke permissions on-chain
- ✅ Spend limits, swap caps, DCA, DeFi, custom rules
- ✅ Private transfers via Cloak (ZK shielded pool)
- ✅ Viewing keys for compliance/audit
- ✅ Activity feed
- ✅ Mobile responsive (iOS-style bottom nav)
- ✅ Light/dark mode
