import { useState } from "react";
import { X, Check, ArrowLeft, ArrowRight, DollarSign, ArrowRightLeft, TrendingUp, Repeat, Layers, Pencil } from "lucide-react";
import { usePermissions } from "@/app/contexts/PermissionContext";
import { useWallet } from "@/app/contexts/WalletContext";
import { useI18n } from "@/app/contexts/I18nContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useKixaContract } from "@/app/hooks/useKixaContract";

/* ─── Types ─── */
interface PermTypeOption {
  value: string;
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  emoji: string;
}

const permTypes: PermTypeOption[] = [
  { value: "spend", labelKey: "ptype.spend", descKey: "ptype.spendDesc", icon: DollarSign, emoji: "💸" },
  { value: "swap", labelKey: "ptype.swap", descKey: "ptype.swapDesc", icon: ArrowRightLeft, emoji: "🔄" },
  { value: "perp", labelKey: "ptype.perp", descKey: "ptype.perpDesc", icon: TrendingUp, emoji: "📈" },
  { value: "dca", labelKey: "ptype.dca", descKey: "ptype.dcaDesc", icon: Repeat, emoji: "🔁" },
  { value: "defi", labelKey: "ptype.defi", descKey: "ptype.defiDesc", icon: Layers, emoji: "🏦" },
  { value: "custom", labelKey: "ptype.custom", descKey: "ptype.customDesc", icon: Pencil, emoji: "⚙️" },
];

const tokens = ["SOL", "USDC", "USDT"] as const;

/* ─── Step 2 config forms ─── */
function StepConfigSpend({ config, setConfig, t }: ConfigFormProps) {
  return (
    <div className="space-y-5">
      <Field label={t("field.maxValue" as any)}>
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="0.5" className="modal-input" />
      </Field>
      <Field label={t("field.token" as any)}>
        <ChipSelect options={tokens as unknown as string[]} value={config.token || "SOL"} onChange={(v) => setConfig({ ...config, token: v })} />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

function StepConfigSwap({ config, setConfig, t }: ConfigFormProps) {
  return (
    <div className="space-y-5">
      <Field label={t("field.sourceToken" as any)}>
        <ChipSelect options={tokens as unknown as string[]} value={config.fromToken || "SOL"} onChange={(v) => setConfig({ ...config, fromToken: v })} />
      </Field>
      <Field label={t("field.destToken" as any)}>
        <ChipSelect options={tokens as unknown as string[]} value={config.toToken || "USDC"} onChange={(v) => setConfig({ ...config, toToken: v })} />
      </Field>
      <Field label={t("field.maxPerTx" as any)}>
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="1.0" className="modal-input" />
      </Field>
      <Field label={t("field.maxSwaps" as any)}>
        <input type="number" value={config.maxSwaps || ""} onChange={(e) => setConfig({ ...config, maxSwaps: e.target.value })}
          placeholder="10" className="modal-input" />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

function StepConfigPerp({ config, setConfig, t }: ConfigFormProps) {
  return (
    <div className="space-y-5">
      <Field label="Max Position Size">
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="50" className="modal-input" />
      </Field>
      <Field label="Collateral Token">
        <ChipSelect options={tokens as unknown as string[]} value={config.token || "USDC"} onChange={(v) => setConfig({ ...config, token: v })} />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

function StepConfigDCA({ config, setConfig, t }: ConfigFormProps) {
  const frequencies = ["Daily", "Weekly", "Biweekly", "Monthly"];
  return (
    <div className="space-y-5">
      <Field label="Amount Per Buy">
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="10" className="modal-input" />
      </Field>
      <Field label="From Token">
        <ChipSelect options={tokens as unknown as string[]} value={config.fromToken || "SOL"} onChange={(v) => setConfig({ ...config, fromToken: v })} />
      </Field>
      <Field label="To Token">
        <ChipSelect options={tokens as unknown as string[]} value={config.toToken || "USDC"} onChange={(v) => setConfig({ ...config, toToken: v })} />
      </Field>
      <Field label="Frequency">
        <ChipSelect options={frequencies} value={config.frequency || "Weekly"} onChange={(v) => setConfig({ ...config, frequency: v })} />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

function StepConfigDeFi({ config, setConfig, t }: ConfigFormProps) {
  const protocols = ["Marinade", "Jupiter", "Raydium", "Drift", "Kamino", "Other"];
  return (
    <div className="space-y-5">
      <Field label="Protocol">
        <ChipSelect options={protocols} value={config.protocol || "Marinade"} onChange={(v) => setConfig({ ...config, protocol: v })} />
      </Field>
      <Field label="Max Amount">
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="10" className="modal-input" />
      </Field>
      <Field label={t("field.token" as any)}>
        <ChipSelect options={tokens as unknown as string[]} value={config.token || "SOL"} onChange={(v) => setConfig({ ...config, token: v })} />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

function StepConfigCustom({ config, setConfig, t }: ConfigFormProps) {
  return (
    <div className="space-y-5">
      <Field label={t("field.ruleDesc" as any)}>
        <textarea value={config.description || ""} onChange={(e) => setConfig({ ...config, description: e.target.value })}
          placeholder={t("field.rulePlaceholder" as any)} rows={3} className="modal-input resize-none" />
      </Field>
      <Field label={t("field.maxValue" as any)}>
        <input type="number" step="0.01" value={config.limit || ""} onChange={(e) => setConfig({ ...config, limit: e.target.value })}
          placeholder="1.0" className="modal-input" />
      </Field>
      <Field label={t("field.token" as any)}>
        <ChipSelect options={tokens as unknown as string[]} value={config.token || "SOL"} onChange={(v) => setConfig({ ...config, token: v })} />
      </Field>
      <Field label={t("field.duration" as any)}>
        <DurationSelect t={t} value={config.expHours} onChange={(h) => setConfig({ ...config, expHours: h })} customDays={config.customDays} onCustomDays={(d) => setConfig({ ...config, customDays: d })} />
      </Field>
    </div>
  );
}

/* ─── Shared UI primitives ─── */
type TFunc = (key: any) => string;
interface ConfigFormProps { config: any; setConfig: (c: any) => void; t: TFunc }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function ChipSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${value === o ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-foreground hover:bg-muted"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function DurationSelect({ value, onChange, customDays, onCustomDays, t }: { value: number; onChange: (h: number) => void; customDays?: string; onCustomDays: (d: string) => void; t: TFunc }) {
  const durations = [
    { labelKey: "dur.1day", hours: 24 },
    { labelKey: "dur.7days", hours: 168 },
    { labelKey: "dur.30days", hours: 720 },
    { labelKey: "dur.custom", hours: 0 },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {durations.map((d) => (
          <button key={d.labelKey} onClick={() => onChange(d.hours)}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${value === d.hours ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-foreground hover:bg-muted"}`}>
            {t(d.labelKey as any)}
          </button>
        ))}
      </div>
      {value === 0 && (
        <input type="number" placeholder={t("field.customDays" as any)} value={customDays || ""} onChange={(e) => onCustomDays(e.target.value)}
          className="modal-input mt-2" />
      )}
    </div>
  );
}

/* ─── Summary builder ─── */
function buildSummary(type: string, config: any, t: TFunc): string {
  const token = config.token || config.fromToken || "SOL";
  const limit = config.limit || "0";
  const hours = config.expHours === 0 ? (parseInt(config.customDays || "7") * 24) : config.expHours;
  const days = Math.round(hours / 24);

  const replace = (key: string, vars: Record<string, string | number>) => {
    let str = t(key as any);
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, String(v)); });
    return str;
  };

  switch (type) {
    case "spend":
      return replace("summary.spendDays", { limit, token, days });
    case "swap":
      return replace("summary.swapDays", { from: config.fromToken || "SOL", to: config.toToken || "USDC", limit, days });
    case "perp":
      return replace("summary.perpDays", { limit, token, days });
    case "dca":
      return replace("summary.timeDays", { start: config.startTime || "09:00", end: config.endTime || "18:00", limit, token, days });
    case "defi": {
      const count = (config.addresses || "").split("\n").filter((a: string) => a.trim()).length;
      return replace("summary.defiDays", { limit, token, days });
    }
    case "custom":
      return replace("summary.customDays", { desc: config.description || "—", limit, token, days });
    default:
      return replace("summary.spendDays", { limit, token, days });
  }
}

/* ─── Main Modal ─── */
export default function CreatePermissionModal({ onClose }: { onClose: () => void }) {
  const { addPermission } = usePermissions();
  const { grantPermission } = useKixaContract(); const { shortAddress } = useWallet();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({ token: "SOL", expHours: 168 });
  const [success, setSuccess] = useState(false);

  const resolvedHours = config.expHours === 0 ? (parseInt(config.customDays || "7") * 24) : config.expHours;

  const handleConfirm = async () => {
    if (!selectedType) return;
    try {
      const scope = `${selectedType}:${config.limit || "0"}:${config.token || config.fromToken || "SOL"}`;
      const agentId = `kixa-${selectedType}-${Date.now()}`;
      await grantPermission({
        agentId,
        scope,
        expiresInHours: resolvedHours,
        isNewAgent: false,
      });
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + resolvedHours);
      await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey,
          type: selectedType,
          name: selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + " Permission",
          description: buildSummary(selectedType, config, t),
          token: config.token || config.fromToken || "SOL",
          limit: config.limit || "0",
          config: config,
          expiration: expiration.toISOString(),
        }),
      });
      setSuccess(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });
      setTimeout(onClose, 2500);
    } catch (err) {
      toast.error("Erro ao gravar permissão on-chain");
      console.error(err);
    }
  };

  const configForms: Partial<Record<string, React.FC<ConfigFormProps>>> = {
    spend: StepConfigSpend,
    swap: StepConfigSwap,
    perp: StepConfigPerp,
    dca: StepConfigDCA,
    defi: StepConfigDeFi,
    custom: StepConfigCustom,
  };

  const ConfigForm = selectedType ? configForms[selectedType] : null;
  const selectedMeta = permTypes.find((p) => p.value === selectedType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card-elevated w-full max-w-lg p-5 sm:p-6 animate-in max-h-[90vh] overflow-y-auto">

        {success ? (
          <div className="flex flex-col items-center py-10" style={{ animation: "success-pop 0.4s ease-out forwards" }}>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="text-xl font-bold">{t("stepper.successTitle" as any)}</p>
            <p className="text-sm text-muted-foreground mt-2">{t("stepper.successDesc" as any)}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-lg font-semibold">
                  {step === 1 ? t("stepper.step1" as any) : step === 2 ? t("stepper.step2" as any) : t("stepper.step3" as any)}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>

            {/* Step 1: Choose type */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {permTypes.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = selectedType === pt.value;
                  return (
                    <button
                      key={pt.value}
                      onClick={() => { setSelectedType(pt.value); setConfig({ token: "SOL", expHours: 168 }); }}
                      className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-semibold">{t(pt.labelKey as any)}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(pt.descKey as any)}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 2 && ConfigForm && (
              <ConfigForm config={config} setConfig={setConfig} t={t} />
            )}

            {/* Step 3: Review */}
            {step === 3 && selectedMeta && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      {(() => { const Icon = selectedMeta.icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t(selectedMeta.labelKey as any)}</p>
                      <p className="text-xs text-muted-foreground">KIXA Agent · {shortAddress}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {buildSummary(selectedType!, config, t)}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span>{t("review.type" as any)}</span>
                    <span className="font-medium text-foreground">{t(selectedMeta.labelKey as any)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span>{t("review.limit" as any)}</span>
                    <span className="font-medium text-foreground">{config.limit || "0"} {config.token || config.fromToken || "SOL"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span>{t("review.duration" as any)}</span>
                    <span className="font-medium text-foreground">{Math.round(resolvedHours / 24)} {t("review.days" as any)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>{t("review.agent" as any)}</span>
                    <span className="font-medium text-foreground">KIXA Agent</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl bg-muted/50 text-sm font-medium hover:bg-muted transition-all active:scale-[0.98]">
                  {t("stepper.back" as any)}
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !selectedType}
                  className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {t("stepper.next" as any)}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {t("stepper.confirm" as any)}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
