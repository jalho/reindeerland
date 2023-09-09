#include "server.h"

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
	return -1; // TODO: close the server socket
}
