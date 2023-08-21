#include <iostream>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main()
{
    int serverSocket, clientSocket;
    struct sockaddr_in serverAddr, clientAddr;
    socklen_t addrSize = sizeof(struct sockaddr_in);

    // Create a socket
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == -1)
    {
        perror("Error creating socket");
        return 1;
    }

    // Bind the socket to an IP address and port
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(8080); // Port 8080
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) == -1)
    {
        perror("Error binding socket");
        return 1;
    }

    // Listen for incoming connections
    if (listen(serverSocket, 5) == -1)
    {
        perror("Error listening");
        return 1;
    }

    std::cout << "Server is listening on port 8080..." << std::endl;

    while (true)
    {
        // Accept a client connection
        clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddr, &addrSize);
        if (clientSocket == -1)
        {
            perror("Error accepting connection");
            return 1;
        }

        std::cout << "Client connected" << std::endl;

        // Handle the HTTP request (minimal response)
        std::string response = "HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!";
        send(clientSocket, response.c_str(), response.length(), 0);

        std::cout << "Client disconnected" << std::endl;

        // Close the client socket
        close(clientSocket);
    }

    // Close the server socket
    close(serverSocket);

    return 0;
}
