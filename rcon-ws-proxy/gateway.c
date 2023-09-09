#include "gateway.h"

int rwp_handle_connection(int *client_fd)
{
	printf("Writing something to the connected client socket...");
	const char *response = "HTTP/1.1 204 No Content\r\n\r\n";
	int written = write(*client_fd, response, strlen(response));
	if (written < 0)
		printf(" Failed!\n");
	else
		printf(" Success! Wrote %d bytes\n", written);
	printf("Closing the client socket...");
	if (close(*client_fd) < 0)
		printf(" Failed!\n");
	else
		printf(" Closed!\n");
	return 0;
}
