#include <netinet/in.h>
#include <pthread.h>
#include <signal.h>
#include <stdio.h>
#include <sys/signalfd.h>
#include <sys/socket.h>

#include "rwp-errors.h"
#include "rwp-gateway.h"
#include "rwp-log.h"
#include "rwp-server.h"

int main()
{
	///
	/// INIT PROCESS LIFECYCLE STUFF
	///

	// define which signals to handle in the "signal sink"
	sigset_t signal_sink_mask;
	sigemptyset(&signal_sink_mask);
	sigaddset(&signal_sink_mask, SIGINT);
	sigaddset(&signal_sink_mask, SIGQUIT);

	// block the signals so they aren't handled the default way
	if (sigprocmask(SIG_BLOCK, &signal_sink_mask, NULL) == -1)
		return RWP_ERR_TODO;

	// create the "signal sink"
	int signal_sink_fd;
	signal_sink_fd = signalfd(-1, &signal_sink_mask, 0);
	if (signal_sink_fd == -1)
		return RWP_ERR_TODO;

	///
	/// INIT NETWORKING STUFF
	///

	// create a server socket
	int server_fd = socket(AF_INET, SOCK_STREAM, 0);
	if (server_fd < 0)
		return RWP_SERVER_SOCK_CANNOT_CREATE;

	// define server address and start it
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
	pthread_t handler_id;
	int status = pthread_create(&handler_id, NULL, &rwp_server_accept, &server_fd);
	if (status == 0)
		rwp_log("Waiting for new connections...\n");
	else
		rwp_log("Failed to handle concurrently!\n");

	// program lifecycle management; continuously read captured signal info from the "signal sink"
	struct signalfd_siginfo signal_info_buf;
	ssize_t signal_info_read_bytes;
	while (1)
	{
		signal_info_read_bytes = read(signal_sink_fd, &signal_info_buf, sizeof(signal_info_buf));
		if (signal_info_read_bytes != sizeof(signal_info_buf))
			return RWP_ERR_TODO;

		if (signal_info_buf.ssi_signo == SIGINT)
		{
			rwp_log("Got SIGINT\n");
			rwp_server_shutdown();
			return RWP_ERR_TODO;
		}
	}
	return 0;
}
