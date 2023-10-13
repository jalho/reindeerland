#ifndef RWP_SERVER_H
#define RWP_SERVER_H

#include <netinet/in.h>
#include <pthread.h>
#include <unistd.h>

#include "rwp-errors.h"
#include "rwp-gateway.h"
#include "rwp-log.h"

typedef struct {
    int server_socket;
} RWP_Server;

/**
 * Bind a given address to a given server socket and prepare to accept
 * connections.
 *
 * Returns 0 on success.
 */
int rwp_server_init(RWP_Server *server, struct sockaddr_in *server_address);

/**
 * Gracefully shut down server, freeing any occupied resources etc.
 *
 * Returns 0 on success.
 */
int rwp_server_shutdown(RWP_Server *server);

/**
 * Start accepting network connections.
 */
void *rwp_server_accept(void *server);

#endif
