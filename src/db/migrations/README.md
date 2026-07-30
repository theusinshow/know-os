# Migrations

Generated Drizzle migrations live here. Do not commit disposable local database state.

Use these commands:

```text
pnpm db:generate
pnpm db:migrate
```

`pnpm db:migrate` requires `DATABASE_URL` to point at the target PostgreSQL database. Do not run it against production without confirming the target environment and backup/rollback plan.
