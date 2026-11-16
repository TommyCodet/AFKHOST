# AFKHOST
Self-hosted Mineflayer AFK bot panel for one Debian VPS. No public signup, Pterodactyl or extra nodes.

## Features in this first MVP
- Admin-created users, password hashing and per-user bot limits
- Admin bot assignment with Minecraft host, port, username, version and optional local bind IP
- User sees only assigned bots; start, stop, restart and chat
- WebSocket log stream, SQLite database and persistent sessions
- Mineflayer reconnect and basic anti-AFK jump

## Local setup
Node.js 20+: `cp .env.example .env`, set a random SESSION_SECRET (at least 32 characters) and an initial ADMIN_USERNAME / ADMIN_PASSWORD (at least 12 characters), then `npm install && npm start`. Open http://127.0.0.1:3000. Remove ADMIN_PASSWORD from the environment after the first admin is created.

## Debian single-VPS deployment
1. `sudo useradd --system --create-home --shell /usr/sbin/nologin afkhost`
2. Clone to `/opt/afkhost`; install Node.js 20+; run `npm ci --omit=dev`.
3. Create `/etc/afkhost.env` from `.env.example`. Set `DATA_DIR=/var/lib/afkhost`, a strong unique session secret and initial admin credentials.
4. `sudo install -d -o afkhost -g afkhost /var/lib/afkhost`; protect env file with `sudo chown root:afkhost /etc/afkhost.env && sudo chmod 640 /etc/afkhost.env`.
5. Install `deploy/afkhost.service` as `/etc/systemd/system/afkhost.service`, then `sudo systemctl daemon-reload && sudo systemctl enable --now afkhost`.
6. Configure Nginx from `deploy/nginx.conf.example`. Point DNS A record `afkbots.dachhost.com` at the VPS and use Certbot for HTTPS. Do not expose port 3000 directly.

Only bind IP addresses that are actually assigned/routed to the VPS. This is an early MVP: test before public use. File manager, stronger network isolation, IP allowlisting, audit log, backup automation and production hardening remain future work.
