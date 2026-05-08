# Space Shooter

Space Shooter is a small multiplayer experiment built around a split-screen setup:

- the host opens the game on a larger screen
- a phone joins through a QR code
- the phone's motion controls the crosshair
- the phone sends fire events back to the Phaser scene

The repository is split into a React/Vite client and a Node.js Socket.IO server.

## Project Layout

- `client/`: React 19 + Vite 7 frontend, pairing flow, QR code generation, controller UI, and Phaser gameplay
- `server/`: Express + Socket.IO HTTPS server that creates game sessions and relays controller/screen events

## Current Flow

1. Open the client root route on the host device.
2. The host creates a game session over Socket.IO.
3. The UI renders a QR code for `/controller/:gameId`.
4. A phone scans the QR code and opens the controller route.
5. After motion permission is granted, device orientation drives the crosshair on the host screen.
6. Fire events are sent back to the Phaser scene, and kill rewards are pushed to the controller.

Client routes:

- `/`: connection and pairing screen
- `/screen/:gameId`: Phaser game screen
- `/controller/:gameId`: mobile controller

## Requirements

- Node.js 20+ recommended
- Two devices on the same network for the QR/controller flow
- HTTPS on both client and server

HTTPS matters here because mobile device-orientation APIs usually require a secure context.

## Environment

The client currently relies on `VITE_BASE_URL` to build the QR code URL:

```env
VITE_BASE_URL=https://YOUR-LAN-IP:5173
```

The socket client currently connects to:

```text
https://<current-hostname>:3002
```

That means the client and server are expected to run on the same host name or LAN IP.

## Local Development

Start the HTTPS socket server:

```bash
cd server
npm install
npm run dev
```

Notes:

- the server reads certificates from `server/certs/server-key.pem` and `server/certs/server-cert.pem`
- run the server from the `server/` directory so those relative paths resolve correctly

Start the client:

```bash
cd client
npm install
npm run dev
```

Notes:

- the Vite dev server is exposed on `0.0.0.0`
- `vite-plugin-mkcert` is enabled, so the client runs over HTTPS in development
- update `client/.env.development` with the LAN URL you want the phone to open from the QR code

## Build

Build the client bundle:

```bash
cd client
npm run build
```

Preview the built client locally:

```bash
cd client
npm run preview
```

The server is plain Node.js and does not have a separate build step.

## Implementation Notes

- Game/session state is stored in memory on the server
- Pairing is driven through Socket.IO events such as `createGame`, `joinGame`, `orientation`, `fire`, and `kill`
- The Phaser scene currently uses simple moving targets with different hit counts, rewards, and speeds

## Known Constraints

- `VITE_BASE_URL` must be defined for QR pairing to generate a valid controller URL
- the socket URL is currently derived from `window.location.hostname` instead of an environment variable
- the checked-in certificates are suitable for local development, not production
