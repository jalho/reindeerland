#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include "gateway.h"
#include "server.h"

/**
 * TCP server.
 */
int main()
{
	int server_fd = socket(AF_INET, SOCK_STREAM, 0);
	if (server_fd < 0)
		return 1;

	struct sockaddr_in server_saddr = {
		.sin_family = AF_INET,
		.sin_port = htons(8080),
		.sin_addr.s_addr = INADDR_ANY,
	};

	if (rwp_server_init(&server_fd, &server_saddr) < 0)
		return 2;

	struct sockaddr client_saddr = {};
	socklen_t client_saddr_sz = sizeof client_saddr;
	while (1)
	{
		printf("Waiting for new connections...\n");
		int client_fd = accept(server_fd, &client_saddr, &client_saddr_sz);
		if (client_fd < 0)
			return 3;
		rwp_handle_connection(&client_fd);
	}
	return 0;
}
