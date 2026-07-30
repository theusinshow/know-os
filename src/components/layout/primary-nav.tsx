"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Braces,
  ChartNoAxesColumnIncreasing,
  Database,
  Download,
  FolderKanban,
  History,
  Map,
  Medal,
  RotateCcw,
  TriangleAlert,
  Upload
} from "lucide-react";

const navigationItems = [
  { label: "Fundação", href: "/", icon: Database, match: ["/"] },
  { label: "Trilhas", href: "/tracks", icon: BookOpen, match: ["/tracks", "/lessons", "/concepts"] },
  { label: "Importar", href: "/import", icon: Upload, match: ["/import"] },
  { label: "Histórico", href: "/history", icon: History, match: ["/history"] },
  { label: "Review", href: "/review", icon: RotateCcw, match: ["/review"] },
  { label: "Erros", href: "/mistakes", icon: TriangleAlert, match: ["/mistakes"] },
  { label: "Projetos", href: "/projects", icon: FolderKanban, match: ["/projects"] },
  { label: "Progresso", href: "/progress", icon: ChartNoAxesColumnIncreasing, match: ["/progress"] },
  { label: "Mapa", href: "/knowledge-map", icon: Map, match: ["/knowledge-map"] },
  { label: "Exports", href: "/exports", icon: Download, match: ["/exports"] },
  { label: "Badges", href: "/achievements", icon: Medal, match: ["/achievements"] }
];

const plannedItems = [
  { label: "Lições", icon: Map },
  { label: "Laboratório", icon: Braces }
];

function isCurrentRoute(pathname: string, matches: string[]) {
  return matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));
}

export function PrimaryNav() {
  const pathname = usePathname() ?? "/";

  return (
    <>
      {navigationItems.map((item, index) => {
        const Icon = item.icon;
        const isCurrent = isCurrentRoute(pathname, item.match);

        return (
          <Link
            className={isCurrent ? "nav-current" : "nav-link"}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            key={item.href}
          >
            <span className="nav-index">{String(index + 1).padStart(2, "0")}</span>
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {plannedItems.map((item) => {
        const Icon = item.icon;

        return (
          <span className="nav-placeholder" aria-disabled="true" key={item.label}>
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
            <span className="nav-note">em preparação</span>
          </span>
        );
      })}
    </>
  );
}
