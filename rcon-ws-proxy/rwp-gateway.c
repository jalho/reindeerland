#include "rwp-gateway.h"
#include "rwp-log.h"

void* rwp_handle_connection(void *client_fd)
{
	rwp_log("Handling a connection\n");

	// TODO: evaluate auth

	// TODO: do WebSocket handshake and leave socket open

	// TODO: close socket when client seems gone
	// 	 (should not rely on explicit ending handshake)
	// 	 (maybe require some aliveness pulse?)

	rwp_log("Writing something to the connected client socket...\n");
	const char *response = "HTTP/1.1 204 No Content\r\n\r\n";
	int written = write(*(int*)client_fd, response, strlen(response));
	if (written < 0)
		rwp_log("Write failed!\n");
	else
		rwp_log("Wrote successfully!\n");
	rwp_log("Closing the client socket...\n");
	if (close(*(int*)client_fd) < 0)
		rwp_log("Failed to close client socket!\n");
	else
		rwp_log("Client socket closed successfully!\n");
	return (void*)NULL;
}
