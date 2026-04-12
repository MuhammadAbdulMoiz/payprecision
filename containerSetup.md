podman exec payprecision sh -c "cp /db/payprecision.db /db/backup-pre-update.db"
podman stop payprecision && podman rm payprecision && podman rmi payprecision:latest
podman build --rm -t payprecision .
podman run -d --name payprecision -p 3000:3000 -v payprecision-db:/db -v payprecision-backups:/backups -e NODE_ENV=production -e PORT=3000 -e DB_PATH=/db -e BACKUP_DIR=/backups -e ADMIN_TOKEN=secret-token payprecision:latest