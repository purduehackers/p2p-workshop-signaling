# WebRTC Signaling Server

This is a simple WebRTC signaling server built with Bun and DrizzleORM. It uses
Bun SQLite as the database and supports basic WebRTC signaling features.

Anyone can use this server to establish peer-to-peer connections using WebRTC. The
server is publicly accessible at: `https://webrtc-signaling.purduehackers.com`.

Built for the Peer-to-Peer Video Games Workshop! 04/01/2025

## Deployment

Should you want to deploy this server yourself, a Dockerfile is provided. You can
build and run the Docker image with the following commands:

```bash
docker build -t webrtc-signaling-server .
docker run -p 3001:3001 webrtc-signaling-server
```

We have deployed this server using fly.io. You can find the deployment
configuration in the `fly.toml` file.
