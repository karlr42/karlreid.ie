# ingram maintenance runbook

## Current state — 21 November 2026

The existing DigitalOcean Droplet was upgraded in place through each LTS release: Ubuntu 16.04 → 18.04 → 20.04 → 22.04 → 24.04. Each hop was fully updated and rebooted. The server now runs Ubuntu 24.04.5 LTS, kernel `6.8.0-151-generic`, NGINX `1.24.0-2ubuntu7.21`, and OpenSSH `1:9.6p1-3ubuntu13.20`. The package database is clean with no pending upgrades.

The Droplet and its public IP, `46.101.92.99`, are unchanged. Domain registration, Blacknight nameservers, all DNS records, Titan mailbox settings and mail credentials were left untouched. The final DNS check matched the original NS, A, absent AAAA, MX and apex TXT records. No local mail server, mail-related cron jobs, or running Java/PHP services were found. This is not an end-to-end mailbox send/receive test; the owner should verify normal mailbox operation.

The personal site is now static HTML/CSS with a small script and no third-party build or runtime dependencies. No Node, Docker, Mono or bot runtime is needed on the server. At the owner's request, unused bot/development runtimes were removed after their data, Docker image and container filesystem were archived. Bot source/data and the old document root remain on disk; nothing was restarted.

## Website and security configuration

- Build off-server with Node 22 or newer: `npm ci && npm run build`.
- Live release: `/var/www/karlreid/releases/20261121-1a48b3c`; `/var/www/karlreid/current` points to it. The original `/var/www/html` remains intact.
- `deploy/nginx.conf` matches the installed site configuration. Both HTTP hostnames and HTTPS `www` redirect to `https://karlreid.ie`, preserving paths and queries.
- TLS 1.2 and 1.3 are enabled. TLS 1.0/1.1 are rejected. Certbot maintains `/etc/letsencrypt/options-ssl-nginx.conf` and the existing certificate/account. HTTP/2 remains disabled because this small static site does not need it.
- A self-only Content Security Policy, `nosniff`, referrer policy, dotfile denial and real 404 responses are active. NGINX version disclosure is disabled.
- The installed NGINX package exceeds Ubuntu's fixed Noble revision `1.24.0-2ubuntu7.20` for [CVE-2026-123007](https://ubuntu.com/security/CVE-2026-123007) and [CVE-2026-123633](https://ubuntu.com/security/CVE-2026-123633). Check the full distribution revision, not only the upstream version.
- Key-based SSH login is retained. Password and keyboard-interactive SSH authentication and X11 forwarding are disabled. Console/sudo passwords are unchanged. Fresh key login was tested after hardening.
- UFW is active; the only public listeners are SSH 22, HTTP 80 and HTTPS 443. The DNS stub listens only on loopback. The release-upgrader's temporary SSH listener is gone.
- A private 2 GiB `/swapfile` is active and recorded in fstab. Approximately 16 GiB disk and 679 MiB memory were available after the final reboot.

## Automated upkeep

Ubuntu security updates are enabled through `apt-daily` / `apt-daily-upgrade` and unattended-upgrades. Automatic reboots are disabled, so reboot-requiring security updates still need a planned reboot. The unattended-upgrade dry run passed with no pending updates.

Certbot 2.9.0 and its NGINX plugin are installed from Ubuntu packages. `certbot.timer` is enabled. A simulated renewal for both hostnames passed against the final configuration:

```sh
sudo certbot renew --dry-run --non-interactive --no-random-sleep-on-renew
```

The current production certificate covers both names and expires on 7 January 2027. Renewal uses the existing NGINX authenticator and installer; DNS-based validation and mailbox credentials are not involved. Monitor timer failures and actual certificate expiry.

DigitalOcean `do-agent` 3.18.17 and `droplet-agent` 1.4.4 are current and active. Only their signed vendor repositories were restored. The obsolete Mono and Certbot PPA sources remain retired. Official Ubuntu repositories provide OS updates.

## Cloud-init compatibility repair

The 2016 image had local dpkg diversions that overrode maintained cloud-init modules with incompatible Python files. These were archived, the diversions removed, and current package modules restored. The obsolete DigitalOcean cloud-config override was also archived. `/etc/cloud/cloud.cfg.d/99-preserve-existing-server.cfg` explicitly preserves the established static network, hostname, users and SSH keys and disables vendor-data execution. Provisioning state was preserved; `cloud-init clean` was not run.

Cloud-init completes after reboot, with no failed services or error-level boot journal entries. Its status still reports the legacy DigitalOcean metadata datasource's deprecation (scheduled for removal in cloud-init 28.2), plus a warning about an obsolete module in cached vendor data. This old Droplet needs a review of datasource compatibility before a future major cloud-init/OS upgrade. Do not clear provisioning state or allow cloud-init to rewrite networking casually.

## Private recovery copies

The completed powered-off DigitalOcean snapshot is `ingram-before-os-upgrade-2026-11-21` (9.12 GB, LON1). Retain it until satisfied with the upgraded system. It contains the original OS and data; it is not a routine current backup.

Durable local archives are in `/Users/karl/Backups/ingram-20261121`, directory mode 700 and files mode 600:

- `recovery-files.tar.gz`: original configuration, home/root data, website, Nadeko data, Docker volumes, package state, cron and boot files.
- `nadeko-image.tar.gz`: saved `kwoth/nadeko:dev` image.
- `nadeko-container-filesystem.tar.gz`: exported stopped container filesystem.
- `nadeko-container.json`: container settings and mount mappings.
- `legacy-development-files.tar.gz`: `/usr/local`, `/opt` and old VM/container development data.

Archive checksums and gzip/tar integrity were verified. Copies also exist in temporary staging, but the durable directory and provider snapshot are the recovery copies. These files contain secrets and private keys: never commit, publish or print their contents.

On the server, `/root/codex-maintenance-20261121` contains original configuration, retired Node binaries/modules and cloud-init overrides, package/firewall inventories, upgrade logs for each LTS hop and validation logs. Original data remains under `/home/jonathan`, `/nadeko` and the retired Docker data directories. Access requires normal administrative authentication once maintenance access is removed.

## Deployment and rollback

Upload a new `dist/` into a new root-owned directory under `/var/www/karlreid/releases/`. Validate `nginx -t`, change `/var/www/karlreid/current` to the new release, then verify public pages and assets. Keep the preceding static release. `rollback-current-server.sh RELEASE_DIRECTORY` switches back to a retained static release while preserving the current security configuration.

The archived 2016 NGINX configuration is forensic recovery material, not a normal rollback target: it restores weaker TLS settings and obsolete behavior. Recover from an OS failure using the provider snapshot on the same Droplet and the provider console. A rebuild wipes the disk; a new Droplet does not preserve this public IP. Never change DNS or mail routing to work around an upgrade problem.

## Completion checks

Home/contact documents and CSS/JS matched the local build by SHA-256. HTTP and www redirects, valid certificates, TLS 1.2/1.3, old-protocol rejection, security headers, 404s and dotfile blocking passed. Browser checks covered home, contact navigation and the legacy `/#/contact` link. Fresh SSH access, firewall, DNS resolution, agent services, package health and reboot recovery passed.

The temporary `/etc/sudoers.d/90-codex-maintenance` grant was removed after privileged work finished. Sudo configuration validation passed; cached authorization was cleared, and a fresh key login confirmed `sudo -n true` fails with a password-required message. Normal password-based administrator rights are retained. No upgrade screens or temporary maintenance timers remain. The DigitalOcean image badge may still name the original Ubuntu 16.04 image; `/etc/os-release` and the running kernel identify the upgraded OS.
