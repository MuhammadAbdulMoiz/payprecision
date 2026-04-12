# PayPrecision — Container Rebuild Guide

## Prerequisites
- Podman installed
- Run all commands from `C:\internee\salary-calculator`
- Use **Windows Command Prompt** or **PowerShell** (not Git Bash for podman commands)

---

## Every-time rebuild (copy-paste this whole block)

```cmd
podman exec payprecision sh -c "cp /db/payprecision.db /db/backup-$(date +%%Y-%%m-%%d).db"
podman stop payprecision
podman rm payprecision
podman rmi payprecision:latest
podman build -t payprecision:latest .
podman run -d --name payprecision -p 3000:3000 -v payprecision-db:/db -v payprecision-backups:/backups -e NODE_ENV=production -e PORT=3000 -e DB_PATH=/db -e BACKUP_DIR=/backups -e ADMIN_TOKEN=your-secret-token payprecision:latest
```

> Change `your-secret-token` to a real secret — use the same one every rebuild.

---

## First-time setup (run once)

```cmd
podman volume create payprecision-db
podman volume create payprecision-backups
podman build -t payprecision:latest .
podman run -d --name payprecision -p 3000:3000 -v payprecision-db:/db -v payprecision-backups:/backups -e NODE_ENV=production -e PORT=3000 -e DB_PATH=/db -e BACKUP_DIR=/backups -e ADMIN_TOKEN=your-secret-token payprecision:latest
```

---

## Verify it's running

```cmd
podman logs payprecision
```
Expected output:
```
PayPrecision server running on port 3000
Database path: /db
Mode: production
```

Open: http://localhost:3000

---

## Admin API (backup/restore)

All admin routes require the header: `x-admin-token: your-secret-token`

### Trigger a backup
```cmd
curl -X POST http://localhost:3000/admin/backup -H "x-admin-token: your-secret-token"
```

### List backups
```cmd
curl http://localhost:3000/admin/backups -H "x-admin-token: your-secret-token"
```

### Restore a backup
```cmd
curl -X POST http://localhost:3000/admin/restore -H "x-admin-token: your-secret-token" -H "Content-Type: application/json" -d "{\"file\":\"db-2026-04-12T02-00-00.db\"}"
```

### Run migrations manually
```cmd
curl -X POST http://localhost:3000/admin/migrate -H "x-admin-token: your-secret-token"
```

> Migrations also run automatically on every container start — this is just for manual use.

---

## Cron backup (Linux VM / WSL)

```bash
# Backup at 2 AM daily
0 2 * * * podman exec payprecision sh -c "cp /db/payprecision.db /backups/db-\$(date +\%F-\%H\%M).db"
```

Or via the Admin API (works from any machine):
```bash
0 2 * * * curl -s -X POST http://localhost:3000/admin/backup -H "x-admin-token: your-secret-token"
```

---

## Copy backup to local machine

```bash
# From Linux/WSL
scp user@your-vm-ip:/var/lib/containers/storage/volumes/payprecision-backups/_data/db-2026-04-12.db ~/Downloads/

# Or use podman cp to extract from volume
podman run --rm -v payprecision-backups:/src alpine cat /src/db-2026-04-12.db > ~/Downloads/db-2026-04-12.db
```

---

## Volumes (your data lives here)

| Volume | Purpose | Survives rebuild? |
|--------|---------|-------------------|
| `payprecision-db` | SQLite DB + images | Yes |
| `payprecision-backups` | DB backups | Yes |

> Never delete volumes. Rebuilding the image/container is safe — volumes persist.

---

## What to do if the app breaks after rebuild

1. **Check logs first:** `podman logs payprecision`
2. **Run migrations:** `curl -X POST http://localhost:3000/admin/migrate -H "x-admin-token: your-secret-token"`
3. **Restore last backup:** Use the restore API or copy the pre-rebuild backup back:
   ```cmd
   podman exec payprecision sh -c "cp /db/backup-2026-04-12.db /db/payprecision.db"
   podman restart payprecision
   ```

---

## Environment variables reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Set to `production` in container |
| `PORT` | `3001` | Server port (use `3000` in container) |
| `DB_PATH` | `../db` | Directory for SQLite file |
| `BACKUP_DIR` | `/backups` | Directory for backup files |
| `ADMIN_TOKEN` | *(none)* | Required for `/admin/*` routes |

---

## Features in this build

- **Calculator** — Salary in PKR from hourly USD rate, extra days (1.5x), leave deductions, provident fund (full-time)
- **Currency toggle** — Per-card PKR↔USD, global toggle, bonus input in USD or PKR
- **History** — Save calculations, SVG projection chart, export PDF + CSV
- **Goals** — Image cards, deposit log timeline, individual savings rate per goal, dashboard with total rate
- **Expenses** — 11 categories (Housing/Food/Transport/Subscriptions/Trips/Treats/Utilities/Healthcare/Education/Shopping/Other), budget limits per category, bar chart + donut chart, recurring expenses, CSV export, salary health indicator
- **PWA** — Installable, offline calculator via service worker

---

## What to add next (suggestions)

| Feature | Effort | Value |
|---------|--------|-------|
| Multi-currency expense tracking (USD amounts) | Low | High |
| Goal sharing — export goal card as image | Low | Medium |
| Salary comparison across months (table view) | Low | High |
| Expense trend chart — 6-month spending per category | Medium | High |
| Notifications — "you're 80% through your Housing budget" | Medium | High |
| Export full financial report (PDF with goals + expenses + salary) | Medium | High |
| Multiple salary profiles (switch between clients/jobs) | Medium | High |
| Bill reminders — due-date field on expenses | Low | Medium |
| Dark/light theme per page section | Low | Low |
| AI spending advice — monthly summary with tips | High | High |
