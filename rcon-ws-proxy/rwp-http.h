#ifndef RWP_HTTP_H
#define RWP_HTTP_H

#include <unistd.h>

#include "rwp-log.h"
#include "rwp-gateway.h"

#define INBOUND_REQUEST_DATA_BUF_SIZE 1024

/**
 * Parsed inbound (HTTP) request.
 */
typedef struct {
    int data_buf_size;
    char data_buf[INBOUND_REQUEST_DATA_BUF_SIZE];
    // maybe parse HTTP stuff here...
} RWP_InboundRequest;

/**
 * Read an inbound (HTTP) request from given `client_fd` into given
 * `request` struct.
 */
int rwp_read_http_request(RWP_ConnectionInitiatingClient *client, RWP_InboundRequest *request);

#endif
