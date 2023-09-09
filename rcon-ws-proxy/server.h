#ifndef RWP_SERVER_H
#define RWP_SERVER_H

#include <netinet/in.h>

#define RWP_SERVER_CANNOT_BIND -1
#define RWP_SERVER_CANNOT_LISTEN -2

/**
 * Binds a given address to a given server socket.
 *
 * Returns 0 on success, and <0 on failures.
 */
int rwp_server_init(int *server_socket, struct sockaddr_in *server_address);

int rwp_server_shutdown();

#endif
