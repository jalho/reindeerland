all-images: admin-ui-image map-service-image rcon-ws-proxy-image tls-proxy-image player-detail-service-image logprocessor-image

admin-ui-image:
	@cd admin-ui && npm install
	@cd admin-ui && npm run build
	@docker build -t admin-ui:local -f admin-ui/Dockerfile admin-ui

map-service-image:
	@docker build -t map-service:local -f map-service/Dockerfile map-service

rcon-ws-proxy-image:
	@cd rcon-ws-proxy && npm install
	@cd rcon-ws-proxy && npm run build
	@docker build -t rcon-ws-proxy:local -f rcon-ws-proxy/Dockerfile rcon-ws-proxy

tls-proxy-image:
	@docker build -t tls-proxy:local -f tls-proxy/Dockerfile tls-proxy

player-detail-service-image:
	@cd player-detail-service && npm install
	@cd player-detail-service && npm run build
	@docker build -t player-detail-service:local -f player-detail-service/Dockerfile player-detail-service

logprocessor-image:
	@docker build -t logprocessor:local -f logprocessor/Dockerfile logprocessor
