all: /opt/run/rust-server/docker-compose.main.yaml \
	 /opt/run/rust-server/docker-compose.aux.yaml \
	 /opt/run/rust-server/discord-hooks.json \
	 /opt/run/rust-server/steamcmd/rust \
	 /opt/run/rust-server/iplocs.json \
	 /opt/run/rust-server/steamcmd/rust/logs \
	 /opt/run/rust-server/discord-hooks.json \
	 /opt/run/rust-server/.env \
	 /opt/run/rust-server/_scripts/wipe.sh \
	 /opt/run/rust-server/tls/fullchain1.pem \
	 /opt/run/rust-server/tls/privkey1.pem

/opt/run/rust-server/docker-compose.main.yaml:
	@wget https://github.com/jalho/reindeerland/raw/master/docker-compose.main.yaml

/opt/run/rust-server/docker-compose.aux.yaml:
	@wget https://github.com/jalho/reindeerland/raw/master/docker-compose.aux.yaml

/opt/run/rust-server/discord-hooks.json:
	@wget https://github.com/jalho/reindeerland/raw/master/discord-hooks.json

/opt/run/rust-server/steamcmd/rust:
	@mkdir -p /opt/run/rust-server/steamcmd/rust/server/docker/cfg
	@mkdir -p /opt/run/rust-server/steamcmd/rust/oxide/plugins
	@wget https://github.com/jalho/reindeerland/raw/master/steamcmd-init/rust/server/docker/cfg/serverauto.cfg -O /opt/run/rust-server/steamcmd/rust/server/docker/cfg/serverauto.cfg
	@wget https://github.com/jalho/reindeerland/raw/master/steamcmd-init/rust/server/docker/cfg/users.cfg -O /opt/run/rust-server/steamcmd/rust/server/docker/cfg/users.cfg
	@wget https://github.com/jalho/reindeerland/raw/master/steamcmd-init/rust/oxide/oxide.config.json -O /opt/run/rust-server/steamcmd/rust/oxide/oxide.config.json
	@wget https://umod.org/plugins/Vanish.cs -O /opt/run/rust-server/steamcmd/rust/oxide/plugins/Vanish.cs
	@wget https://umod.org/plugins/NoGiveNotices.cs -O /opt/run/rust-server/steamcmd/rust/oxide/plugins/NoGiveNotices.cs
	@wget https://umod.org/plugins/AdminRadar.cs -O /opt/run/rust-server/steamcmd/rust/oxide/plugins/AdminRadar.cs

/opt/run/rust-server/iplocs.json:
	@touch /opt/run/rust-server/iplocs.json

/opt/run/rust-server/steamcmd/rust/logs:
	@mkdir -p /opt/run/rust-server/steamcmd/rust/logs

/opt/run/rust-server/discord-hooks.json:
	@wget https://github.com/jalho/reindeerland/raw/master/discord-hooks.json

/opt/run/rust-server/.env:
	@wget https://github.com/jalho/reindeerland/raw/master/example.env -O /opt/run/rust-server/.env

/opt/run/rust-server/_scripts/wipe.sh:
	@mkdir -p /opt/run/rust-server/_scripts
	@wget https://github.com/jalho/reindeerland/raw/master/_scripts/wipe.sh -O /opt/run/rust-server/_scripts/wipe.sh
