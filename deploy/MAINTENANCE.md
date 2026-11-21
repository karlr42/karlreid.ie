# ingram maintenance runbook

## Boundaries

Keep the same Droplet and public IP. Do not change domain registration, nameservers, DNS records, Titan email configuration, or mail credentials. A rebuild of the same Droplet retains its IP but wipes its disk; do not perform a rebuild without a verified full snapshot and recovery access.

## Observed 21 November 2026

- Ubuntu 16.04, kernel 4.4.0-38, NGINX 1.10.3, Docker 1.12.6.
- Only ports 22, 80 and 443 listen; UFW already allows those ports.
- One stopped Nadeko container (last ran eight years ago); preserve its named volume, `/nadeko`, and the older bot source/data in `/home/jonathan`.
- No installed postfix/exim/sendmail/dovecot packages found; no root or jonathan crontabs; no Java/PHP processes found. This inventory is not an end-to-end email delivery test.
- Blacknight authoritative DNS, Titan MX, SPF includes `a` and `spf.blacknight.ie`.
- Certificate covers both web hostnames and expires 7 January 2027.
- Approximately 1 GiB RAM, no swap, 20 GiB disk free. Plan upgrade memory/swap requirements before package installation.
- Legacy Mono/Xamarin and Certbot package repositories require review before upgrading. Do not carry a Debian wheezy repository onto a current Ubuntu release.

## Recovery gate

Require a completed provider snapshot, verified console access, and a tested restoration procedure before OS changes. Preserve application/configuration backups outside the Droplet. Backups contain credentials and private keys: keep them private, outside Git, and move them from temporary storage to an owner-controlled durable location. Verify archive integrity and extract representative files to confirm recoverability.

## Upgrade execution

1. Save installed package versions, apt sources, firewall configuration, SSH configuration, certificates/renewal configuration, Docker metadata and mount mappings, and NGINX configuration.
2. Verify a second SSH session and console access. Keep existing SSH keys, users and firewall rules working throughout.
3. Select supported OS target and review its release notes. For an in-place LTS upgrade, follow sequential LTS hops (16.04 → 18.04 → 20.04 → 22.04 → 24.04), fully updating and verifying/rebooting at each hop. Do not blindly substitute apt codenames or run an unattended multi-release script.
4. Resolve third-party repositories, obsolete packages, disk/memory constraints, and release-upgrader prompts per hop. Preserve bot data; do not restart or delete the stopped container as part of website deployment.
5. Verify package security coverage for NGINX, OpenSSH, kernel and any retained container runtime. Distribution backports require checking the distribution advisory/package revision, not merely the upstream version number.
6. Install the static release only after the upgraded server is stable. Build off-server (`npm ci && npm run build`), upload `dist/` into a new root-owned release directory, and point `/var/www/karlreid/current` to it. The old website and NGINX configuration remain available for rollback.
7. Validate the candidate `nginx.conf` against the actual upgraded binary (`nginx -t`) before installing/reloading. TLS 1.3 requires an appropriately modern NGINX/OpenSSL build. Keep HTTP/2 disabled until its fixes are confirmed.
8. Preserve or migrate Certbot renewal to a maintained package. If switching to webroot renewal, configure `/var/www/acme`, update the existing renewal configuration deliberately, and test renewal with `certbot renew --dry-run` plus a deployment hook that validates and reloads NGINX.
9. Configure supported unattended security updates and monitor renewal failures, disk space, and website availability.

## Verification and rollback

Check apex/www, HTTP→HTTPS redirects, valid certificates, home/contact navigation, `/#/contact` legacy link, images/CSS/JS, and real 404 responses. Verify response headers and ensure only expected network listeners remain. Compare NS/A/AAAA/MX/TXT records with the pre-maintenance baseline; do not edit records to make a check pass. Ask the owner to verify normal mailbox send/receive operation.

For a website regression, restore the previous document root and NGINX configuration after syntax validation. For OS failure, use the recorded provider snapshot recovery procedure on the same Droplet; creating a different Droplet does not preserve its public IP.

After successful maintenance, remove `/etc/sudoers.d/90-codex-maintenance`, ensure there are no leftover privileged maintenance processes/shells, and verify the SSH account no longer has passwordless sudo.

## Initial static deployment completed

On 21 November 2026, release `1a48b3c` was installed at `/var/www/karlreid/releases/20261121-1a48b3c` and `/var/www/karlreid/current` was pointed to it. Existing certificate configuration and hostnames were retained. The three changed configuration files were backed up under `/root/codex-maintenance-20261121` before modification. The original document root `/var/www/html` is intact.

The current, older NGINX serves TLS 1.2 only; TLS 1.0/1.1 were disabled. The future `deploy/nginx.conf` template supports TLS 1.3 and should only be activated after the OS/NGINX upgrade. The live configuration also denies dotfile access and adds a self-only Content Security Policy, `nosniff`, and a referrer policy. The public home and contact documents matched the local build by SHA-256; HTTP redirects, both HTTPS hostnames, 404s and dotfile rejection passed. NS, IP, MX and apex TXT records were unchanged.

`rollback-current-server.sh` restores the original site configuration and TLS settings; it deliberately restores the previous behavior completely, including its weaker TLS settings. Use only to recover from a deployment failure. It is not an OS rollback procedure.

The OS, kernel, NGINX package and container runtime have not yet been upgraded. A verified provider snapshot and console recovery access remain prerequisites for that phase. The GitHub default-branch alerts are not resolved until the static-site branch is merged.
