#include "rwp-gateway.h"
#include "rwp-http.h"
#include "rwp-log.h"

void *rwp_handle_connection(void *client_fd)
{
	rwp_log("Handling a connection\n");
	RWP_InboundRequest inbound_request = {0};
	inbound_request.data_buf_size = INBOUND_REQUEST_DATA_BUF_SIZE;

	int read_bytes_total = rwp_read_http_request(client_fd, &inbound_request);
	int last_read_byte_idx = 0;
	if (read_bytes_total > inbound_request.data_buf_size)
	{
		rwp_log("Missed ");
		printf(
			"%d bytes from client due to buffer size limit (%d bytes read total, up to %d in buffer)\n",
			read_bytes_total - inbound_request.data_buf_size,
			read_bytes_total,
			inbound_request.data_buf_size);
		last_read_byte_idx = inbound_request.data_buf_size - 1;
	}
	else
		last_read_byte_idx = read_bytes_total - 1;
	if (inbound_request.data_buf_size - (last_read_byte_idx + 1) >= 2)
	{
		inbound_request.data_buf[last_read_byte_idx + 1] = '\n';
		inbound_request.data_buf[last_read_byte_idx + 2] = '\0';
		rwp_log(inbound_request.data_buf);
	}
	else
		rwp_log("Cannot log inbound request pretty -- no space for linebreak and null termination\n");

	// TODO: evaluate auth

	// TODO: do WebSocket handshake and leave socket open

	// TODO: close socket when client seems gone
	// 	 (should not rely on explicit ending handshake)
	// 	 (maybe require some aliveness pulse?)

	rwp_log("Writing something to the connected client socket...\n");
	const char *response = "HTTP/1.1 204 No Content\r\n\r\n";
	int written = write(*(int *)client_fd, response, strlen(response));
	if (written < 0)
		rwp_log("Write failed!\n");
	else
		rwp_log("Wrote successfully!\n");
	rwp_log("Closing the client socket...\n");
	if (close(*(int *)client_fd) < 0)
		rwp_log("Failed to close client socket!\n");
	else
		rwp_log("Client socket closed successfully!\n");
	return (void *)NULL;
}
