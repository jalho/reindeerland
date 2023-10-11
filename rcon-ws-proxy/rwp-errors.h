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

/**
 * Related to:  Networking
 */
#define RWP_SERVER_SOCK_CANNOT_CREATE 4

/**
 * Related to:  Networking
 */
#define RWP_SERVER_CANNOT_BIND 5

/**
 * Related to:  Networking
 */
#define RWP_SERVER_CANNOT_LISTEN 6

/**
 * Related to:  Networking
 */
#define RWP_SERVER_CANNOT_ACCEPT 7

/**
 * Related to:  Server startup
 *
 * Meaning:     Server could not spawn a dedicated thread for accepting
 *              network connections.
 */
#define RWP_SERVER_CANNOT_DETACH_ACCEPTOR 8

/**
 * Related to:  Server shutdown
 *
 * Meaning:     Could not close the server socket.
 */
#define RWP_SERVER_CANNOT_CLOSE 9

/**
 * Related to:  Being lazy
 *
 * Meaning:     There is coding to do.
 */
#define RWP_ERR_TODO 99

#endif
