#ifndef RWP_GATEWAY_H
#define RWP_GATEWAY_H

#include <stdio.h>
#include <string.h>

/**
 * Handle an accepted client connection.
 */
void* rwp_handle_connection(void *client_fd);

#endif
