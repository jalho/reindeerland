# rcon-ws-proxy

RCON WebSocket reverse proxy written in C.

RCON is a Steam term (as far as I know) for a program that is used to control
some dedicated Steam game server. More specifically, this project is a reverse
proxy for a WebSocket implementation of an RCON for a dedicated game server of
a Steam video game called Rust. The game server is distributed by name `RustDedicated`.
Let's call it _RDS_ from now on.

`rcon-ws-proxy` is intended to sit in front of RDS, hence calling it a reverse
proxy. Its purpose is to:

1. Provide an authentication layer and fine tuned access control
2. Send information about the game state to connected authenticated clients
3. Deliver RCON commands from the clients to RDS

## build

```
make
```

## usage

TODO!

## conventions

- The function name prefix `rwp_` stands for `rcon-ws-proxy`.
