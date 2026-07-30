import type { LucideIcon } from "lucide-react";

type StatusBadgeProps = Readonly<{
  icon: LucideIcon;
  label: string;
  detail: string;
}>;

export function StatusBadge({ icon: Icon, label, detail }: StatusBadgeProps) {
  return (
    <span className="status-badge">
      <Icon aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
    </span>
  );
}
