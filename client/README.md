# Space Shooter Client

This directory contains the frontend for the Space Shooter experiment.

## Responsibilities

- creates and displays the QR pairing flow on `/`
- renders the Phaser game on `/screen/:gameId`
- provides the mobile controller UI on `/controller/:gameId`
- connects to the Socket.IO server over HTTPS

## Tech Stack

- React 19
- Vite 7
- Phaser 3
- Socket.IO client
- `vite-plugin-mkcert` for HTTPS development certificates

## Environment

The QR code uses `VITE_BASE_URL`:

```env
VITE_BASE_URL=https://YOUR-LAN-IP:5173
```

The socket connection is currently derived from the current browser hostname and port `3002`.

## Development

```bash
npm install
npm run dev
```

Open the app from a LAN-reachable HTTPS URL so the phone can scan the QR code and request motion permissions correctly.

## Build

```bash
npm run build
```
