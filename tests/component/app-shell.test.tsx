import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/layout/app-shell";

describe("AppShell", () => {
  it("renders the accessible foundation shell without claiming product screens are complete", () => {
    render(
      <AppShell>
        <h1>Conteúdo principal</h1>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /pular para o conteúdo principal/i })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(screen.getByRole("link", { name: "KNOW/OS página inicial" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /trilhas/i })).toHaveAttribute("href", "/tracks");
    expect(screen.getByRole("link", { name: /histórico/i })).toHaveAttribute("href", "/history");
    expect(screen.getByRole("link", { name: /review/i })).toHaveAttribute("href", "/review");
    expect(screen.getByRole("link", { name: /erros/i })).toHaveAttribute("href", "/mistakes");
    expect(screen.getByRole("link", { name: /projetos/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /progresso/i })).toHaveAttribute("href", "/progress");
    expect(screen.getByRole("link", { name: /mapa/i })).toHaveAttribute("href", "/knowledge-map");
    expect(screen.getByRole("link", { name: /exports/i })).toHaveAttribute("href", "/exports");
    expect(screen.getByRole("link", { name: /badges/i })).toHaveAttribute("href", "/achievements");
    expect(screen.getByRole("navigation", { name: /navegação principal/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("status")).toHaveTextContent("Fundação ativa");
    expect(screen.getAllByText("em preparação")).toHaveLength(2);
  });
});
