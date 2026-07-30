import Link from "next/link";
import {
  BookOpen,
  Braces,
  ChartNoAxesColumnIncreasing,
  Database,
  Download,
  Medal,
  FolderKanban,
  History,
  Map,
  RotateCcw,
  ShieldCheck,
  TriangleAlert
} from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/status-badge";

const navigationItems = [
  { label: "Lições", icon: Map },
  { label: "Laboratório", icon: Braces }
];

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
          <Link className="nav-current" href="/" aria-current="page">
            <Database aria-hidden="true" />
            <span>Fundação</span>
          </Link>
          <Link className="nav-link" href="/tracks">
            <BookOpen aria-hidden="true" />
            <span>Trilhas</span>
          </Link>
          <Link className="nav-link" href="/history">
            <History aria-hidden="true" />
            <span>Histórico</span>
          </Link>
          <Link className="nav-link" href="/review">
            <RotateCcw aria-hidden="true" />
            <span>Review</span>
          </Link>
          <Link className="nav-link" href="/mistakes">
            <TriangleAlert aria-hidden="true" />
            <span>Erros</span>
          </Link>
          <Link className="nav-link" href="/projects">
            <FolderKanban aria-hidden="true" />
            <span>Projetos</span>
          </Link>
          <Link className="nav-link" href="/progress">
            <ChartNoAxesColumnIncreasing aria-hidden="true" />
            <span>Progresso</span>
          </Link>
          <Link className="nav-link" href="/knowledge-map">
            <Map aria-hidden="true" />
            <span>Mapa</span>
          </Link>
          <Link className="nav-link" href="/exports">
            <Download aria-hidden="true" />
            <span>Exports</span>
          </Link>
          <Link className="nav-link" href="/achievements">
            <Medal aria-hidden="true" />
            <span>Badges</span>
          </Link>
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <span className="nav-placeholder" aria-disabled="true" key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                <span className="nav-note">em preparação</span>
              </span>
            );
          })}
        </nav>

        <main id="main-content" className="main-surface" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
