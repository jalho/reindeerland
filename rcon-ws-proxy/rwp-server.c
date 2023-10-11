#include "rwp-server.h"

int rwp_server_init(RWP_Server *server, struct sockaddr_in *server_address)
{
	if (bind(server->server_socket, (const struct sockaddr *)server_address, sizeof(*server_address)) < 0)
		return RWP_SERVER_CANNOT_BIND;

	if (listen(server->server_socket, 10) < 0)
		return RWP_SERVER_CANNOT_LISTEN;

	return 0;
}

int rwp_server_shutdown(RWP_Server *server)
{
	rwp_log("Shutting down the server...\n");
	if (close(server->server_socket) != 0) return RWP_SERVER_CANNOT_CLOSE;
	else rwp_log("Server closed!\n");
	// TODO: do rest of graceful shutdown;
	//	- close any client sockets
	//  - close any connected upstream stores (not event implemented yet!)
	return 0;
}

void *rwp_server_accept(void *server)
{
	while (1)
	{
		struct sockaddr client_saddr = {};
		socklen_t client_saddr_sz = sizeof client_saddr;
		int client_fd = accept(((RWP_Server *)server)->server_socket, &client_saddr, &client_saddr_sz);
		pthread_t handler_id;
		int status = pthread_create(&handler_id, NULL, &rwp_handle_connection, &client_fd);
		if (status != 0) rwp_log("Failed to handle network connection concurrently!\n");
	}
}
