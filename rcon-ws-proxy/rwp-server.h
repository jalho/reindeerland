#ifndef RWP_SERVER_H
#define RWP_SERVER_H

#include <netinet/in.h>
#include "rwp-errors.h"

/**
 * Binds a given address to a given server socket.
 *
 * Returns 0 on success.
 */
int rwp_server_init(int *server_socket, struct sockaddr_in *server_address);

int rwp_server_shutdown();

#endif
