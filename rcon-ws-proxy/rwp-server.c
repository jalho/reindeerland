#include "rwp-server.h"
#include "rwp-log.h"

int rwp_server_init(int *server_socket, struct sockaddr_in *server_address)
{
	if (bind(*server_socket, (const struct sockaddr *)server_address, sizeof(*server_address)) < 0)
		return RWP_SERVER_CANNOT_BIND;

	if (listen(*server_socket, 10) < 0)
		return RWP_SERVER_CANNOT_LISTEN;

	return 0;
}

void* rwp_server_shutdown()
{
	rwp_log("Shutting down the server...\n");
	// TODO: do a graceful shutdown; close server socket and whatnot
	return (void*)NULL;
}
