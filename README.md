# Usage

Requirements: `docker`

1. Get the Docker composition definition file.

   ```bash
   wget https://github.com/jalho/reindeerland/raw/master/docker-compose.yaml
   ```

2. Define env vars.

   ```bash
   cp example.env .env
   vim .env
   ```

3. Make sure directories and files referenced in the `.env` file exist and
   that secret keys are correct & sensible. You can use `make` as there is a
   [`Makefile`](./Makefile) that at least defines what should be present.

   TODO: Make the `Makefile` wget or generate the stuff required!

4. Start the composition detached and follow logs if you wish.

   ```bash
   docker compose -f docker-compose.main.yaml up -d && docker compose -f docker-compose.aux.yaml up -d
   ```

   ```bash
   docker compose -f docker-compose.main.yaml -f docker-compose.aux.yaml logs -f
   ```

5. Ask _RustDedicated_ to render the gameworld map as a .PNG image.

   ```bash
   docker exec reindeerland rcon rendermap
   ```

   N.B. this should be done as soon as possible after each wipe because as of
   Jun 2023 the operations seems to cause all players to be kicked out of the
   server. That's probably a bug kinda feature in _RustDedicated_ but it is what
   it is...

   TODO: Make `rcon-ws-proxy` issue the `rendermap` command on startup instead!

# Components

- [`admin-ui`](./admin-ui)

  Web page showing a real time map of _Reindeerland_ Rust game server.

- [`map-service`](./map-service)

  HTTP server serving _Reindeerland_ Rust game server map as a .PNG file.

- [`player-detail-service`](./player-detail-service)

  HTTP server storing and providing additional details of players, i.e.
  information not available via RustDedicated RCON such as country information
  and lifetime stats etc.

- [`rcon-ws-proxy`](./rcon-ws-proxy)

  Accepts WebSocket connections from the `admin-ui` for authorized users.
  Expects specific auth headers in `/login` request, and specific auth cookies
  in subsequent WebSocket upgrade request. The cookies are set in response to
  the login request.

  Users can be created via a private HTTP API:

  1. SSH to the server.
  2. `curl "http://172.18.0.5:90" -H "username: foo" -H "password: bar"`

- [`tls-proxy`](./tls-proxy)

  TLS reverse proxy load balancer serving all of the above over TLS.

# Getting TLS cert manually with certbot

IP address is logged publicly by the CA, thus consider running these commands
from the server!

Required: `certbot`

1. Optionally make a directory for certbot stuff. Can `rm -rf` once the cert is
   obtained.

   ```bash
   mkdir ~/temp-certbot
   ```

2. For e.g. domain _sandbox.reindeerland.eu_, do:

   ```bash
   certbot certonly -d sandbox.reindeerland.eu --work-dir ~/temp-certbot/ --logs-dir ~/temp-certbot/ --config-dir ~/temp-certbot/ --manual --register-unsafely-without-email --preferred-challenges dns
   ```

   This starts an interactive session in the terminal. Continue the session
   following the next steps.

3. Make the DNS record that `certbot` asks.

4. Check that the record is served using e.g.

   ```bash
   host -a _acme-challenge.sandbox.reindeerland.eu
   ```

   or [https://toolbox.googleapps.com/apps/dig/#TXT/](https://toolbox.googleapps.com/apps/dig/#TXT/)

5. Finally the TLS certificate and a usable TLS server private key should be in:

   ```
   $ ls -l ~/temp-certbot/archive/sandbox.reindeerland.eu/
   total 20
   -rw-r--r-- 1 jka docker 1866 May 27 11:04 cert1.pem
   -rw-r--r-- 1 jka docker 3749 May 27 11:04 chain1.pem
   -rw-r--r-- 1 jka docker 5615 May 27 11:04 fullchain1.pem
   -rw------- 1 jka docker 1704 May 27 11:04 privkey1.pem
   ```

   For a regular HTTPS server, `fullchain1.pem` and `privkey1.pem` are the
   necessary TLS certificate(s) and the corresponding usable TLS server private
   key.

# Development

First disable TLS in loadbalancer, configure CORS dev policy and update the browser web UI app's upstreams to target the loadbalancer. Then build images with those changes, start Docker composition, create a user and follow logs.
