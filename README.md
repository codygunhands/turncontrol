# TurnControl — Airline Ground Stay Control

A live turnaround and ground stay control system for airline station operations.

Built as a demo for airline operations use, showing real-time flight tracking from arrival to departure, task-level section management, timeline visualization, alerts, and ground stay reports.

---

## Demo Overview

**Station:** Bangkok Suvarnabhumi (BKK / VTBS)

**Pages:**
| Route | Description |
|---|---|
| `/` | Live Overview Dashboard — all active flights with status |
| `/flights` | Flight list view |
| `/flights/[id]` | Flight detail — sections, timing, alerts |
| `/flights/[id]/sections/[section]` | Section task list |
| `/flights/[id]/tasks/[taskId]` | Task detail with status actions |
| `/flights/[id]/timeline` | Gantt-style critical path timeline |
| `/alerts` | Station-wide operational alerts |
| `/reports` | Completed flight report index |
| `/reports/[id]` | Final ground stay report (printable) |

**Flight IDs for direct navigation:**
`tg409`, `nh850`, `sq979`, `fd352`, `vz810`, `pg213`, `tg642`, `nh847`, `ak892`, `sq720`

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Build

```bash
npm install
npm run build
npm start
```

The app runs on port 3000 by default.

---

## Raspberry Pi Hosting

### Requirements
- Raspberry Pi 3B+ or newer (2GB RAM minimum recommended)
- Node.js 18+ installed
- Git installed

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url> turncontrol
cd turncontrol

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Start the app
npm start
```

The app will run at `http://localhost:3000`.

To keep the app running after logout, use `pm2`:

```bash
# Install pm2 globally
npm install -g pm2

# Start the app with pm2
pm2 start npm --name "turncontrol" -- start

# Save the pm2 process list
pm2 save

# Enable pm2 to start on boot
pm2 startup
```

---

## Remote Access via Cloudflare Tunnel

Cloudflare Tunnel lets you expose the app to the internet without opening ports on your router.

### 1. Install cloudflared on the Raspberry Pi

```bash
# For ARM64 (Pi 4, Pi 5):
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# For ARM32 (Pi 3):
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm.deb
sudo dpkg -i cloudflared-linux-arm.deb
```

### 2. Start a quick tunnel

Make sure TurnControl is running on port 3000 first (`npm start`), then:

```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflare will generate a public URL like:
```
https://xxxxx-xxxx-xxxx.trycloudflare.com
```

Copy that URL and send it to Benz. Anyone with that link can access the demo.

### 3. Keep the tunnel running

Run both the app and tunnel in the background:

```bash
# Terminal 1 — app
pm2 start npm --name "turncontrol" -- start

# Terminal 2 — tunnel
cloudflared tunnel --url http://localhost:3000
```

Or use pm2 for the tunnel too:

```bash
pm2 start cloudflared --name "tunnel" -- tunnel --url http://localhost:3000
pm2 save
```

### Notes
- The free quick tunnel URL changes every time cloudflared restarts. For a permanent URL, create a named tunnel with a Cloudflare account (free tier available).
- The tunnel encrypts all traffic between the Pi and the Cloudflare edge — no credentials needed for the demo.

---

## Tech Stack

- **Next.js 16** — App Router, server components
- **TypeScript** — full type safety
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component primitives
- **Lucide React** — icons
- **No backend** — all data is local mock JSON, no database, no API calls

## Data

All flight data is generated fresh on each page request from `src/lib/data.ts`. Times are relative to when the server starts, making the demo feel live. Refreshing the page updates all timers.

No real airline integrations. No paid APIs. No external services required.

---

## Performance Notes for Raspberry Pi

- Uses Next.js static generation where possible
- Server components minimize client-side JavaScript
- No heavy charting libraries — timeline uses CSS/Tailwind
- No websockets — data refreshes on page reload
- Expected memory usage: ~150–200MB RAM
- Expected CPU: idle <5%, page load spikes brief
