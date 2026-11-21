#!/bin/sh
# Restore only the three configuration files changed during the initial deployment.
# Run as root on ingram. The old website remains at /var/www/html.
set -eu
backup=/root/codex-maintenance-20261121
for file in "$backup/nginx/sites-available/default" "$backup/nginx/nginx.conf" "$backup/options-ssl-nginx.conf"; do
    test -f "$file" || { echo "Missing backup: $file" >&2; exit 1; }
done
cp -a "$backup/nginx/sites-available/default" /etc/nginx/sites-available/default
cp -a "$backup/nginx/nginx.conf" /etc/nginx/nginx.conf
cp -a "$backup/options-ssl-nginx.conf" /etc/letsencrypt/options-ssl-nginx.conf
nginx -t
systemctl reload nginx
