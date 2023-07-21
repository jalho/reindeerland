# rcon-ws-proxy

RCON WebSocket Proxy.

## Terminology

- RDS = Rust Dedicated Server
  - the video game server acquired via SteamCMD
  - the executable's name is RustDedicated
- RCON = Remote Console (or whatever??)
  - Valve term?
  - the part of RDS that this program communicates with
  - listens for commands and responds to them
  - sometimes sends messages without a prompt

## Components

- Upstream State Segment Synchronizer (USSS)

  - multiple instances
  - each instance connects to RDS using a WebSocket
  - each instance is in charge of synchronizing a piece of RDS' state
  - each instance has independent configuration for
    - sync frequency in range 100-1000 ms
    - state persistence and storage medium
    - upstream reconnect attempt policy
  - each instance maintains connection to the RCON upstream
    - instance should attempt to reconnect when connection is lost
    - instance should clean up after itself when ceasing operation

- Intermediate State Reader (ISR)

  - reads state of all USSS instances and provides a combined view of them

- Downstream State Synchronizer (DSS)

  - maintains connections to multiple connected downstreams (i.e. web clients)
    - each downstream connects to DSS using a WebSocket
    - detects when a downstream disconnects and adjusts accordingly
  - get sendable state from ISR and sends it to all connected clients
    - sync frequency is configurable in range 100-1000 ms

- WebSocket Gateway (WSG)
  - evaluates auth and handles WebSocket connection upgrade based on that
