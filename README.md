# Usage

Required: `make`, `docker`, `npm`

1. `git clone ${this repository}`
2. `cd ${this repository}`
3. `make`
4. `docker compose up`

# Components

- `admin-ui`

  Web page showing a real time map of _Reindeerland_ Rust game server.

- `map-service`

  HTTP server serving _Reindeerland_ Rust game server map as a .PNG file.

- `rcon-ws-proxy`

  Accepts WebSocket connections from the `admin-ui` for authorized users.
  Expects specific auth headers in `/login` request, and specific auth cookies
  in subsequent WebSocket upgrade request. The cookies are set in response to
  the login request.

- `tls-proxy`

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
