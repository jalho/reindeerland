#include <sys/socket.h>

/**
 * TCP server.
 */
int main()
{
    int listen_fd = socket(AF_INET, SOCK_STREAM, 0);
    return 0;
}
