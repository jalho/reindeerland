#include "rwp-http.h"
#include "rwp-streams.h"

// TODO: Return when HTTP request is considered ended? Now waiting until FIN, i.e. never returning before client closes the connection...
int rwp_read_http_request(RWP_ConnectionInitiatingClient *client, RWP_InboundRequest *request)
{
	/**
	 * Temporary catcher for iterable `read` operation.
	 */
	int read_bytes = -1;
	/**
	 * Total amount of bytes `read`. May include missed bytes, i.e. those that
	 * don't fit into the output buffer.
	 */
	int read_bytes_total = 0;
	/**
	 * Where we're at in the output buffer. Not necessarily the same as
	 * read_bytes_total, as that also counts `read` missed bytes, i.e. those
	 * that don't fit into the buffer.
	 *
	 * Can be interpreted as:
	 * - pointing to the next (available) index in the output buffer
	 * - the output buffer's content's length
	 */
	int read_buffer_offset = 0;

	RWP_DetectableCharacterSequence seq_http_headers_end = {.offset = 0, .seq = "\r\n\r\n", .seq_size = 4};

	/*
		When `client_fd` is a file descriptor of a TCP socket, `read` considers
		end of file reached when the client has sent a packet with FIN flag,
		i.e. intentionally gracefully closed the TCP connection. Therefore this
		loop would end at client connection termination (when `read` returns 0).
	*/
	while ((read_bytes = read(client->client_socket_fd, request->data_buf, request->data_buf_size)) != 0)
	{
		read_bytes_total += read_bytes;

		// move offset, capped to output buffer's size
		if (read_buffer_offset + read_bytes > request->data_buf_size) read_buffer_offset = request->data_buf_size;
		else read_buffer_offset += read_bytes;

		rwp_log("Read buffer's content length is now "); printf("%d bytes (%d bytes read total)\n", read_buffer_offset, read_bytes_total);

		// scan read buffer for a sequence indicating HTTP headers end
		char c;
		for (int i = 0; i < read_bytes; i++) {
			/*
				TODO: Check this logic! Things to consider:
				- read_bytes may be bigger than capacity or size of
				  request->data_buf -- getting scannable char shall not segfault!
				- read may occur multiple times -- sequence scan must move read
				  buffer cursor smoothly!
			*/
			c = request->data_buf[read_buffer_offset - read_bytes + i];
			if (rwp_sequence_match(c, &seq_http_headers_end)) {
				rwp_log("HTTP headers fully received!\n");
				goto done_reading_headers;
			}
		}
	}
	done_reading_headers:
	return read_bytes_total;
}
