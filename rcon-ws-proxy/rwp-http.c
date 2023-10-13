#include "rwp-http.h"

// TODO: Return when HTTP request is considered ended? Now waiting until FIN, i.e. never returning before client closes the connection...
int rwp_read_http_request(int *client_fd, RWP_InboundRequest *request)
{
	int read_bytes = -1;
	int read_bytes_total = 0;

	/*
		When `client_fd` is a file descriptor of a TCP socket, `read` considers
		end of file reached when the client has sent a packet with FIN flag,
		i.e. intentionally gracefully closed the TCP connection. Therefore this
		loop would end at client connection termination (when `read` returns 0).
	*/
	while ((read_bytes = read(*client_fd, request->data_buf, request->data_buf_size)) != 0)
	{
		read_bytes_total += read_bytes;
		// TODO: break out of the loop when it can be determined that the HTTP request has been fully received
	}
	return read_bytes_total;
}
