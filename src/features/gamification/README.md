# Gamification

XP, ranks, missions and badges live here. Gamification must remain separate from mastery.

V1 uses deterministic rules over XP, review state and mistakes to calculate rank, badge eligibility and mission status. Persistence is limited to audit/readback projections:

- `xp_transactions` is the append-only XP ledger.
- `badge_awards` records a badge once when the deterministic rule marks it earned.
- `mission_progress` stores the current deterministic mission status.
- `mission_progress_events` appends status-change audit records.

These records do not certify mastery and must not become inputs to mastery or recommendation policies.
