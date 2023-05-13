#include <sys/socket.h>
#include <netinet/in.h>

/**
 * TCP server.
 */
int main()
{
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0)
        return 1;

    struct sockaddr_in server_saddr = {
        .sin_family = AF_INET,
        .sin_port = htons(8080),
        .sin_addr.s_addr = INADDR_ANY,
    };

    if (bind(server_fd, (struct sockaddr *)&server_saddr, sizeof(server_saddr)) < 0)
        return 2;

    if (listen(server_fd, 10) < 0)
        return 3;

    struct sockaddr client_saddr = {};
    socklen_t client_saddr_sz = sizeof client_saddr;
    while (1)
    {
        int client_fd = accept(server_fd, &client_saddr, &client_saddr_sz);
        if (client_fd < 0)
            return 4;
    }
    return 0;
}
