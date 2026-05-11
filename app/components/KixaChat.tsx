import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle, RefreshCw } from "lucide-react";
import { usePermissions } from "@/app/contexts/PermissionContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { format, formatDistanceToNow, isToday, differenceInHours } from "date-fns";
import { pt, es, enUS } from "date-fns/locale";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  en: { spend: "Spending", mint: "Mint NFT", transfer: "Transfer", execute: "Contract Execution", swap: "Token Swap", time_based: "Time-based", whitelist: "Whitelist", custom: "Custom" },
  pt: { spend: "Gastos", mint: "Mint NFT", transfer: "Transferência", execute: "Execução de Contratos", swap: "Token Swap", time_based: "Time-based", whitelist: "Whitelist", custom: "Custom" },
  es: { spend: "Gastos", mint: "Mint NFT", transfer: "Transferencia", execute: "Ejecución de Contratos", swap: "Token Swap", time_based: "Time-based", whitelist: "Whitelist", custom: "Custom" },
};

function getDateLocale(locale: string) {
  if (locale === "pt") return pt;
  if (locale === "es") return es;
  return enUS;
}

interface KixaChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KixaChat({ open, onOpenChange }: KixaChatProps) {
  const { permissions, activities } = usePermissions();
  const { locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const dateLocale = getDateLocale(locale);

  const active = permissions.filter((p) => p.status === "active");
  const totalLimit = active.reduce((sum, p) => sum + parseFloat(p.limit || "0"), 0);
  const simulatedSpent = totalLimit * 0.35;
  const usagePercent = totalLimit > 0 ? Math.round((simulatedSpent / totalLimit) * 100) : 0;

  const expiringPerms = active.filter((p) => differenceInHours(p.expiration, new Date()) <= 48 && differenceInHours(p.expiration, new Date()) > 0);
  const todayActivities = activities.filter((a) => isToday(a.timestamp));

  const SUGGESTIONS: Record<string, { label: string; message: string }[]> = {
    en: [
      { label: "What can you do?", message: "What can you do?" },
      { label: "Am I safe?", message: "Am I safe?" },
      { label: "What happened today?", message: "What happened today?" },
      { label: "What's my limit?", message: "What's my limit?" },
    ],
    pt: [
      { label: "O que você pode fazer?", message: "O que você pode fazer?" },
      { label: "Estou seguro?", message: "Estou seguro?" },
      { label: "O que aconteceu hoje?", message: "O que aconteceu hoje?" },
      { label: "Qual meu limite?", message: "Qual meu limite?" },
    ],
    es: [
      { label: "¿Qué puedes hacer?", message: "¿Qué puedes hacer?" },
      { label: "¿Estoy seguro?", message: "¿Estoy seguro?" },
      { label: "¿Qué pasó hoy?", message: "¿Qué pasó hoy?" },
      { label: "¿Cuál es mi límite?", message: "¿Cuál es mi límite?" },
    ],
  };

  const greetings: Record<string, string> = {
    en: "Hey! 👋 I'm KIXA, your on-chain guardian. I monitor every AI action on your wallet and only let through what you've authorized. What do you want to know?",
    pt: "Hey! 👋 Sou KIXA, seu guardião on-chain. Monitoro cada ação da IA na sua carteira e só deixo passar o que você autorizou. O que você quer saber?",
    es: "¡Hey! 👋 Soy KIXA, tu guardián on-chain. Monitoreo cada acción de la IA en tu wallet y solo dejo pasar lo que autorizaste. ¿Qué quieres saber?",
  };

  useEffect(() => {
    if (open && !initialized) {
      const msgs: Message[] = [
        { id: 0, role: "ai", text: greetings[locale] || greetings.en, timestamp: new Date() },
      ];

      // Proactive alert for expiring permissions
      if (expiringPerms.length > 0) {
        const alertTexts: Record<string, (name: string, time: string) => string> = {
          en: (name, time) => `⚠️ Heads up: your **${name}** permission expires ${time}. Want to renew now?`,
          pt: (name, time) => `⚠️ Atenção: sua permissão **${name}** expira ${time}. Quer renovar agora?`,
          es: (name, time) => `⚠️ Atención: tu permiso **${name}** expira ${time}. ¿Quieres renovar ahora?`,
        };
        const p = expiringPerms[0];
        const typeLabel = TYPE_LABELS[locale]?.[p.type] || p.type;
        const timeLeft = formatDistanceToNow(p.expiration, { addSuffix: true, locale: dateLocale });
        msgs.push({
          id: 1,
          role: "ai",
          text: (alertTexts[locale] || alertTexts.en)(typeLabel, timeLeft),
          timestamp: new Date(),
          actions: [
            { label: locale === "pt" ? "Renovar" : locale === "es" ? "Renovar" : "Renew", action: "renew" },
            { label: locale === "pt" ? "Depois" : locale === "es" ? "Después" : "Later", action: "later" },
          ],
        });
      }

      setMessages(msgs);
      setInitialized(true);
    }
    if (!open) {
      setInitialized(false);
      setMessages([]);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const respond = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    const labels = TYPE_LABELS[locale] || TYPE_LABELS.en;

    // "What can you do?" / "O que você pode fazer?"
    if (lower.includes("pode fazer") || lower.includes("can you do") || lower.includes("puedes hacer") || lower.includes("autorizado") || lower.includes("authorized") || lower.includes("what can")) {
      if (active.length === 0) {
        return locale === "pt"
          ? "Atualmente não tenho nenhuma permissão ativa. 🔒 Você precisa criar permissões na aba **Permissões** para que eu possa agir."
          : locale === "es"
          ? "Actualmente no tengo permisos activos. 🔒 Necesitas crear permisos en la pestaña **Permisos** para que pueda actuar."
          : "I currently have no active permissions. 🔒 You need to create permissions in the **Permissions** tab so I can act.";
      }
      const lines = active.map((p) => `• **${labels[p.type] || p.type}** — up to ${p.limit} SOL (${locale === "pt" ? "até" : locale === "es" ? "hasta" : "until"} ${format(p.expiration, "dd MMM", { locale: dateLocale })})`);
      const block = locale === "pt"
        ? `Posso autorizar as seguintes ações:\n\n${lines.join("\n")}\n\nBloqueio qualquer tentativa fora desses limites. Estou protegendo sua carteira. 🛡️`
        : locale === "es"
        ? `Puedo autorizar las siguientes acciones:\n\n${lines.join("\n")}\n\nBloqueo cualquier intento fuera de estos límites. Estoy protegiendo tu wallet. 🛡️`
        : `I can authorize the following actions:\n\n${lines.join("\n")}\n\nI block any attempt outside these limits. I'm protecting your wallet. 🛡️`;
      return block;
    }

    // "Am I safe?" / "Estou seguro?"
    if (lower.includes("seguro") || lower.includes("safe") || lower.includes("seguridad")) {
      const noSuspicious = locale === "pt" ? "Nenhuma ação suspeita detectada hoje." : locale === "es" ? "Ninguna acción sospechosa detectada hoy." : "No suspicious actions detected today.";
      if (locale === "pt") return `Sim. ✅ Você tem **${active.length}** permissão(ões) ativa(s). ${noSuspicious} Seu limite diário está **${usagePercent}%** utilizado.`;
      if (locale === "es") return `Sí. ✅ Tienes **${active.length}** permiso(s) activo(s). ${noSuspicious} Tu límite diario está **${usagePercent}%** utilizado.`;
      return `Yes. ✅ You have **${active.length}** active permission(s). ${noSuspicious} Your daily limit is **${usagePercent}%** used.`;
    }

    // "What happened today?" / "O que aconteceu hoje?"
    if (lower.includes("aconteceu") || lower.includes("happened today") || lower.includes("pasó hoy") || lower.includes("hoje") || lower.includes("today") || lower.includes("hoy")) {
      if (todayActivities.length === 0) {
        return locale === "pt" ? "Nenhuma atividade registrada hoje. Tudo tranquilo por aqui. 😌" : locale === "es" ? "Ninguna actividad registrada hoy. Todo tranquilo por aquí. 😌" : "No activity recorded today. All quiet here. 😌";
      }
      const eventLabels: Record<string, Record<string, string>> = {
        en: { created: "Created", revoked: "Revoked", expired: "Expired" },
        pt: { created: "Criada", revoked: "Revogada", expired: "Expirada" },
        es: { created: "Creado", revoked: "Revocado", expired: "Expirado" },
      };
      const lines = todayActivities.map((a) => `• **${(eventLabels[locale] || eventLabels.en)[a.type]}** — ${labels[a.type] || a.type} às ${format(a.timestamp, "HH:mm")}`);
      const header = locale === "pt" ? `Detectei **${todayActivities.length}** evento(s) hoje:` : locale === "es" ? `Detecté **${todayActivities.length}** evento(s) hoy:` : `I detected **${todayActivities.length}** event(s) today:`;
      return `${header}\n\n${lines.join("\n")}`;
    }

    // "What's my limit?" / "Qual meu limite?"
    if (lower.includes("limite") || lower.includes("limit") || lower.includes("quanto") || lower.includes("how much") || lower.includes("cuánto")) {
      if (active.length === 0) {
        return locale === "pt" ? "Você não tem limites ativos no momento. Crie permissões para definir seus limites." : locale === "es" ? "No tienes límites activos. Crea permisos para definir tus límites." : "You have no active limits. Create permissions to set your limits.";
      }
      const remaining = (totalLimit - simulatedSpent).toFixed(2);
      if (locale === "pt") return `Seu limite total é **${totalLimit.toFixed(2)} SOL**.\n\nJá utilizado: **${simulatedSpent.toFixed(2)} SOL** (${usagePercent}%)\nRestante: **${remaining} SOL**\n\nEstou monitorando cada transação. 👀`;
      if (locale === "es") return `Tu límite total es **${totalLimit.toFixed(2)} SOL**.\n\nYa utilizado: **${simulatedSpent.toFixed(2)} SOL** (${usagePercent}%)\nRestante: **${remaining} SOL**\n\nEstoy monitoreando cada transacción. 👀`;
      return `Your total limit is **${totalLimit.toFixed(2)} SOL**.\n\nUsed: **${simulatedSpent.toFixed(2)} SOL** (${usagePercent}%)\nRemaining: **${remaining} SOL**\n\nI'm monitoring every transaction. 👀`;
    }

    // "Will my permission expire?" / "Minha permissão vai expirar?"
    if (lower.includes("expir") || lower.includes("vencer") || lower.includes("renovar") || lower.includes("renew")) {
      if (expiringPerms.length === 0) {
        return locale === "pt" ? "Posso confirmar que nenhuma das suas permissões está próxima de expirar. Tudo tranquilo! ✅" : locale === "es" ? "Puedo confirmar que ninguno de tus permisos está por expirar. ¡Todo tranquilo! ✅" : "I can confirm none of your permissions are close to expiring. All good! ✅";
      }
      const lines = expiringPerms.map((p) => {
        const timeLeft = formatDistanceToNow(p.expiration, { addSuffix: true, locale: dateLocale });
        return `• **${labels[p.type] || p.type}** — ${locale === "pt" ? "expira" : locale === "es" ? "expira" : "expires"} ${timeLeft}`;
      });
      const header = locale === "pt" ? `⚠️ Detectei ${expiringPerms.length} permissão(ões) expirando em breve:` : locale === "es" ? `⚠️ Detecté ${expiringPerms.length} permiso(s) por expirar:` : `⚠️ I detected ${expiringPerms.length} permission(s) expiring soon:`;
      return `${header}\n\n${lines.join("\n")}\n\n${locale === "pt" ? "Recomendo renovar para manter sua proteção ativa." : locale === "es" ? "Recomiendo renovar para mantener tu protección activa." : "I recommend renewing to keep your protection active."}`;
    }

    // Greetings
    if (lower.match(/^(hello|hi|hey|olá|oi|eae|fala|hola|buen|opa)/)) {
      const g: Record<string, string[]> = {
        en: ["Hey! 👋 Great to have you here. I'm watching your wallet — ask me anything!", "Hi there! Your guardian is on duty. What do you need?", "Hello! Everything secure on my end. How can I help?"],
        pt: ["Oi! 👋 Que bom te ver por aqui. Estou de olho na sua carteira — me pergunta qualquer coisa!", "E aí! Seu guardião está de plantão. No que posso ajudar?", "Olá! Tudo seguro por aqui. Como posso te ajudar?"],
        es: ["¡Hey! 👋 Qué bueno tenerte aquí. Estoy vigilando tu wallet — ¡pregúntame lo que quieras!", "¡Hola! Tu guardián está de servicio. ¿Qué necesitas?", "¡Hola! Todo seguro por aquí. ¿Cómo puedo ayudarte?"],
      };
      const arr = g[locale] || g.en;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Thanks
    if (lower.match(/(obrigad|thank|valeu|gracias|vlw)/)) {
      return locale === "pt" ? "Disponha! Estou sempre aqui protegendo sua carteira. 🛡️" : locale === "es" ? "¡De nada! Siempre estoy aquí protegiendo tu wallet. 🛡️" : "You're welcome! I'm always here protecting your wallet. 🛡️";
    }

    // Help
    if (lower.includes("help") || lower.includes("ajuda") || lower.includes("ayuda")) {
      if (locale === "pt") return "Posso te ajudar com:\n\n• **\"O que você pode fazer?\"** — Mostro suas permissões ativas\n• **\"Estou seguro?\"** — Verifico o status de segurança\n• **\"O que aconteceu hoje?\"** — Resumo as atividades do dia\n• **\"Qual meu limite?\"** — Mostro uso e limites\n• **\"Minha permissão vai expirar?\"** — Verifico expirações\n\nEstou aqui pra proteger você! 🛡️";
      if (locale === "es") return "Puedo ayudarte con:\n\n• **\"¿Qué puedes hacer?\"** — Muestro tus permisos activos\n• **\"¿Estoy seguro?\"** — Verifico el estado de seguridad\n• **\"¿Qué pasó hoy?\"** — Resumo las actividades del día\n• **\"¿Cuál es mi límite?\"** — Muestro uso y límites\n• **\"¿Mi permiso va a expirar?\"** — Verifico expiraciones\n\n¡Estoy aquí para protegerte! 🛡️";
      return "I can help you with:\n\n• **\"What can you do?\"** — Show your active permissions\n• **\"Am I safe?\"** — Check security status\n• **\"What happened today?\"** — Summary of today's activities\n• **\"What's my limit?\"** — Show usage and limits\n• **\"Will my permission expire?\"** — Check expirations\n\nI'm here to protect you! 🛡️";
    }

    // Fallback
    if (active.length > 0) {
      return locale === "pt"
        ? `Não entendi 100%, mas estou aqui! Você tem **${active.length}** permissão(ões) ativa(s) e estou monitorando tudo. Tente me perguntar "O que você pode fazer?" ou "Estou seguro?"`
        : locale === "es"
        ? `No entendí del todo, ¡pero estoy aquí! Tienes **${active.length}** permiso(s) activo(s) y estoy monitoreando todo. Intenta preguntarme "¿Qué puedes hacer?" o "¿Estoy seguro?"`
        : `I didn't quite catch that, but I'm here! You have **${active.length}** active permission(s) and I'm monitoring everything. Try asking me "What can you do?" or "Am I safe?"`;
    }
    return locale === "pt"
      ? "Não entendi, mas estou aqui! 😊 Você ainda não tem permissões ativas. Crie uma na aba **Permissões** para que eu possa proteger sua carteira!"
      : locale === "es"
      ? "No entendí, ¡pero estoy aquí! 😊 Aún no tienes permisos activos. ¡Crea uno en la pestaña **Permisos** para que pueda proteger tu wallet!"
      : "I didn't understand, but I'm here! 😊 You don't have active permissions yet. Create one in the **Permissions** tab so I can protect your wallet!";
  };

  const addAiMessage = (text: string, actions?: { label: string; action: string }[]) => {
    setTyping(true);
    const delay = Math.min(400 + text.length * 3, 1500);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text, timestamp: new Date(), actions }]);
    }, delay);
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: msg, timestamp: new Date() }]);
    setInput("");
    addAiMessage(respond(msg));
  };

  const handleAction = (action: string) => {
    if (action === "renew") {
      addAiMessage(
        locale === "pt"
          ? "Para renovar, vá até a aba **Permissões**, encontre a permissão e clique em **Renovar**. Posso te ajudar com mais alguma coisa?"
          : locale === "es"
          ? "Para renovar, ve a la pestaña **Permisos**, encuentra el permiso y haz clic en **Renovar**. ¿Puedo ayudarte con algo más?"
          : "To renew, go to the **Permissions** tab, find the permission and click **Renew**. Can I help with anything else?"
      );
    } else {
      addAiMessage(
        locale === "pt"
          ? "Sem problemas! Vou te avisar novamente quando estiver mais perto. 👍"
          : locale === "es"
          ? "¡Sin problemas! Te avisaré de nuevo cuando esté más cerca. 👍"
          : "No problem! I'll remind you again when it's closer. 👍"
      );
    }
  };

  const suggestions = SUGGESTIONS[locale] || SUGGESTIONS.en;
  const showSuggestions = messages.length <= 2 && !typing;

  // Simple markdown-like bold rendering
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const typingLabel = locale === "pt" ? "KIXA está digitando..." : locale === "es" ? "KIXA está escribiendo..." : "KIXA is typing...";
  const testAgentLabel = locale === "pt" ? "Testar Agente" : locale === "es" ? "Probar Agente" : "Test Agent";
  const placeholderLabel = locale === "pt" ? "Pergunte sobre suas permissões..." : locale === "es" ? "Pregunta sobre tus permisos..." : "Ask about your permissions...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[min(42rem,calc(100vw-2rem))] h-[min(520px,calc(100dvh-8rem))] max-h-[calc(100dvh-8rem)] !top-1/2 !left-1/2 !translate-x-[-50%] !translate-y-[-50%] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            {testAgentLabel}
            <span className="mr-6 flex items-center gap-1.5 text-[10px] text-muted-foreground font-normal uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {locale === "pt" ? "Online" : locale === "es" ? "En línea" : "Online"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"} animate-in`}>
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className="max-w-[80%] space-y-1">
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-primary/10 text-foreground rounded-bl-md"
                  }`}
                >
                  {renderText(m.text)}
                </div>
                {m.actions && (
                  <div className="flex gap-2 pt-1">
                    {m.actions.map((a) => (
                      <Button
                        key={a.action}
                        variant={a.action === "renew" ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => handleAction(a.action)}
                      >
                        {a.action === "renew" && <RefreshCw className="w-3 h-3" />}
                        {a.label}
                      </Button>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground/60 px-1">
                  {format(m.timestamp, "HH:mm")}
                </span>
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.message)}
                  className="px-3 py-1.5 text-xs rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2.5 animate-in">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-primary/10 text-sm text-muted-foreground flex items-center gap-2">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="text-xs">{typingLabel}</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="border-t border-border/50 p-3 flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !typing && handleSend()}
            placeholder={placeholderLabel}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || typing} size="icon" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
