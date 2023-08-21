#include <iostream>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#include "util/str.hpp"

class Server
{
public:
    int start();
    Server() {}
private:
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_size = sizeof(struct sockaddr_in);
};
int Server::start() {
    std::cout << "Starting server..." << std::endl;

    // Create a socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == -1)
    {
        perror("Error creating socket");
        return -1;
    }

    // Bind the socket to an IP address and port
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(8080); // Port 8080
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) == -1)
    {
        perror("Error binding socket");
        return -1;
    }

    // Listen for incoming connections
    if (listen(server_socket, 5) == -1)
    {
        perror("Error listening");
        return -1;
    }

    std::cout << "Server is listening on port 8080..." << std::endl;

    while (true)
    {
        // Accept a client connection
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &addr_size);
        if (client_socket == -1)
        {
            perror("Error accepting connection");
            return 1;
        }

        std::cout << "Client connected" << std::endl;

        // Handle the HTTP request (minimal response)
        std::string response_content = "foo bar";
        std::string response_template = "HTTP/1.1 200 OK\r\nContent-Length: [content_len]\r\n\r\n[content]";
        std::pair<std::string, int> response = subst_get_len(response_template, "[content]", response_content);
        response = subst_get_len(response.first, "[content_len]", std::to_string(response_content.length()));
        send(client_socket, response.first.c_str(), response.second, 0);

        std::cout << "Client disconnected" << std::endl;

        // Close the client socket
        close(client_socket);
    }
}

int main()
{
    Server server = Server();
    server.start();
    // TODO: implement server.close() that closes the server socket!
    return 0;
}
