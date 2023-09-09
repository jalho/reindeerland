#include "gateway.h"
#include "rwp-log.h"

int rwp_handle_connection(int *client_fd)
{
	rwp_log("Handling a connection\n");
	rwp_log("Writing something to the connected client socket...\n");
	const char *response = "HTTP/1.1 204 No Content\r\n\r\n";
	int written = write(*client_fd, response, strlen(response));
	if (written < 0)
		rwp_log("Write failed!\n");
	else
		rwp_log("Wrote successfully!\n");
	rwp_log("Closing the client socket...\n");
	if (close(*client_fd) < 0)
		rwp_log("Failed to close!\n");
	else
		rwp_log("Closed successfully!\n");
	return 0;
}
