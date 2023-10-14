#ifndef RWP_GATEWAY_H
#define RWP_GATEWAY_H

#include <stdio.h>
#include <string.h>

typedef struct {
    int client_socket_fd;
    /**
     * Whether the (TCP) connection is on, i.e. it has been established and has
     * not yet been closed.
     */
    int connection_on;
} RWP_ConnectionInitiatingClient;

/**
 * Handle an accepted client connection.
 */
void* rwp_handle_connection(void *client_fd);

#endif
