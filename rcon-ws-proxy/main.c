#include <signal.h>
#include <sys/signalfd.h>
#include <unistd.h>

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
		return RWP_PROC_CANNOT_BLOCK_SIGNAL;

	// create the "signal sink"
	int signal_sink_fd;
	signal_sink_fd = signalfd(-1, &signal_sink_mask, 0);
	if (signal_sink_fd == -1)
		return RWP_PROC_SIGNAL_SINK_INIT_FAIL;

	///
	/// INIT NETWORKING STUFF
	///

	// create a server socket
	RWP_Server server = {0};
	int server_fd = socket(AF_INET, SOCK_STREAM, 0);
	if (server_fd < 0)
		return RWP_SERVER_SOCK_CANNOT_CREATE;
	else server.server_socket = server_fd;

	// define server address and start it
	struct sockaddr_in server_saddr = {
		.sin_family = AF_INET,
		.sin_port = htons(8080),
		.sin_addr.s_addr = INADDR_ANY,
	};
	int server_status = -1;
	if ((server_status = rwp_server_init(&server, &server_saddr)) != 0)
	{
		return server_status;
	}
	pthread_t handler_id;
	int status = pthread_create(&handler_id, NULL, &rwp_server_accept, &server);
	if (status == 0)
		rwp_log("Waiting for new connections...\n");
	else
		return RWP_SERVER_CANNOT_DETACH_ACCEPTOR;

	// program lifecycle management; continuously read captured signal info from the "signal sink"
	struct signalfd_siginfo signal_info_buf;
	ssize_t signal_info_read_bytes;
	while (1)
	{
		signal_info_read_bytes = read(signal_sink_fd, &signal_info_buf, sizeof(signal_info_buf));
		if (signal_info_read_bytes != sizeof(signal_info_buf))
			return RWP_PROC_SIGNAL_SINK_READ_FAIL;

		if (signal_info_buf.ssi_signo == SIGINT)
		{
			rwp_log("Got SIGINT\n");
			return rwp_server_shutdown(&server);
		}
	}
}
