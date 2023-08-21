#ifndef SERVER_H
#define SERVER_H

#include <iostream>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#include "../util/str.hpp"

class Server
{
public:
    int start();

    Server();

private:
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t _addr_size;
};

#endif
