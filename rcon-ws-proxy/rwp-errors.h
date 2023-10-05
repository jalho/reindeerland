#ifndef RWP_ERRORS_H
#define RWP_ERRORS_H

/**
 * Related to:  Process lifecycle management
 *
 * Meaning:     Failed to block some signals in preparation to set up custom
 *              handling logic for the signals.
 */
#define RWP_PROC_CANNOT_BLOCK_SIGNAL 1

/**
 * Related to:  Process lifecycle management
 *
 * Meaning:     Failed to set up a file descriptor sink for facilitating process
 *              lifecycle signal handling.
 */
#define RWP_PROC_SIGNAL_SINK_INIT_FAIL 2

/**
 * Related to:  Process lifecycle management
 *
 * Meaning:     Failed to read information of a process lifecycle signal
 *              received in a file descriptor sink.
 */
#define RWP_PROC_SIGNAL_SINK_READ_FAIL 3

#define RWP_SERVER_SOCK_CANNOT_CREATE 4
#define RWP_SERVER_CANNOT_BIND 5
#define RWP_SERVER_CANNOT_LISTEN 6
#define RWP_SERVER_CANNOT_ACCEPT 7
#define RWP_ERR_TODO 99 // TODO: remove this, and define properly instead!

#endif
