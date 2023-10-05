#include "rwp-server.h"

int rwp_server_init(int *server_socket, struct sockaddr_in *server_address)
{
	if (bind(*server_socket, (const struct sockaddr *)server_address, sizeof(*server_address)) < 0)
		return RWP_SERVER_CANNOT_BIND;

	if (listen(*server_socket, 10) < 0)
		return RWP_SERVER_CANNOT_LISTEN;

	return 0;
}

int rwp_server_shutdown()
{
	rwp_log("Shutting down the server...\n");
	// TODO: do a graceful shutdown; close server socket and whatnot
	return RWP_ERR_TODO;
}

void *rwp_server_accept(void *server_socket)
{
	while (1)
	{
		struct sockaddr client_saddr = {};
		socklen_t client_saddr_sz = sizeof client_saddr;
		int client_fd = accept(*(int *)server_socket, &client_saddr, &client_saddr_sz);
		pthread_t handler_id;
		int status = pthread_create(&handler_id, NULL, &rwp_handle_connection, &client_fd);
		if (status == 0)
			rwp_log("Handling in a separate thread!\n");
		else
			rwp_log("Failed to handle concurrently!\n");
	}
}
