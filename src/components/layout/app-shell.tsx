import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { PrimaryNav } from "@/components/layout/primary-nav";
import { StatusBadge } from "@/components/ui/status-badge";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo principal
      </a>

      <header className="topbar">
        <Link className="brand-link" href="/" aria-label="KNOW/OS página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static official SVG lockup from public/branding. */}
          <img src="/branding/know-os-lockup.svg" alt="KNOW/OS" width="154" height="38" />
        </Link>
        <div className="topbar-status" role="status" aria-live="polite">
          <StatusBadge icon={ShieldCheck} label="Fundação ativa" detail="Sem dependência de IA" />
        </div>
      </header>

      <div className="workspace-frame">
        <nav className="sidebar" aria-label="Navegação principal">
          <PrimaryNav />
        </nav>

        <main id="main-content" className="main-surface" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
