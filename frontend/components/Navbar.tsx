"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useLang } from "@/contexts/LangContext";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      className="sticky top-0 z-20 px-6 py-3.5"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "var(--c-primary)" }}
          >
            A
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
            {t("appTitle")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden text-xs font-medium"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-surface)" }}
          >
            {(["en", "ja"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: lang === l ? "var(--c-primary)" : "transparent",
                  color: lang === l ? "#fff" : "var(--c-text-muted)",
                }}
              >
                {l === "en" ? "EN" : "JP"}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-surface)",
              color: "var(--c-text-muted)",
            }}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>

          {/* History link */}
          <Link
            href="/history"
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-surface)",
              color: "var(--c-text-muted)",
            }}
          >
            {t("history")} →
          </Link>
        </div>
      </div>
    </nav>
  );
}
