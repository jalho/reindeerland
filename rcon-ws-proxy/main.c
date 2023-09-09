#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>

#include "rwp-errors.h"
#include "rwp-gateway.h"
#include "rwp-server.h"
#include "rwp-log.h"

/**
 * TCP server.
 */
int main()
{
	int server_fd = socket(AF_INET, SOCK_STREAM, 0);
	if (server_fd < 0)
		return RWP_SERVER_SOCK_CANNOT_CREATE;

	struct sockaddr_in server_saddr = {
		.sin_family = AF_INET,
		.sin_port = htons(8080),
		.sin_addr.s_addr = INADDR_ANY,
	};
	int server_status = -1;
	if ((server_status = rwp_server_init(&server_fd, &server_saddr)) != 0)
	{
		return server_status;
	}

	struct sockaddr client_saddr = {};
	socklen_t client_saddr_sz = sizeof client_saddr;
	while (1)
	{
		rwp_log("Waiting for new connections...\n");
		int client_fd = accept(server_fd, &client_saddr, &client_saddr_sz);
		if (client_fd < 0)
			return RWP_SERVER_CANNOT_ACCEPT;
		rwp_handle_connection(&client_fd);
	}
	return 0;
}
