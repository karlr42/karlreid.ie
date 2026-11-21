#!/bin/sh
# Switch to a retained static release without reverting security configuration.
# Run as root on ingram: ./rollback-current-server.sh /var/www/karlreid/releases/RELEASE
set -eu
release=${1:?Provide a retained static release directory}
case "$release" in
    /var/www/karlreid/releases/*) ;;
    *) echo 'Release must be under /var/www/karlreid/releases/' >&2; exit 1 ;;
esac
test -f "$release/index.html"
nginx -t
previous=$(readlink /var/www/karlreid/current)
ln -sfn "$release" /var/www/karlreid/current
if ! systemctl reload nginx; then
    ln -sfn "$previous" /var/www/karlreid/current
    exit 1
fi
