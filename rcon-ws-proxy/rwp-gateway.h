#ifndef RWP_GATEWAY_H
#define RWP_GATEWAY_H

#include <stdio.h>
#include <unistd.h>
#include <string.h>

#define INBOUND_REQUEST_DATA_BUF_SIZE 1024
typedef struct {
    int data_buf_size;
    char data_buf[INBOUND_REQUEST_DATA_BUF_SIZE];
} RWP_InboundRequest;

/**
 * Handle an accepted client connection.
 */
void* rwp_handle_connection(void *client_fd);

#endif
