#!/bin/sh
set -eu

attempt=1
until php /var/www/html/backend/scripts/initialize_database.php; do
  if [ "$attempt" -ge 15 ]; then
    echo "Banco indisponível após $attempt tentativas." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 2
done

php /var/www/html/backend/scripts/sync_project_catalog.php
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/feira.conf
