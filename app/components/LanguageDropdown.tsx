import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, Locale } from "@/app/contexts/I18nContext";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function LanguageDropdown({ openUp = false }: { openUp?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 176 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      if (openUp) {
        setPos({ top: r.top - 8, left: r.left, width: Math.max(r.width, 176) });
      } else {
        setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 176) });
      }
    }
    setOpen(!open);
  };

  const current = languages.find((l) => l.code === locale)!;

  const dropdownStyle: React.CSSProperties = openUp
    ? { position: "fixed", bottom: `calc(100vh - ${pos.top}px)`, left: pos.left, width: pos.width, zIndex: 9999 }
    : { position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 w-full"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden md:inline">{current.label}</span>
      </button>

      {open && (
        <div
          style={dropdownStyle}
          className="rounded-xl bg-popover border border-border shadow-lg py-1 animate-scale-in"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {locale === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
