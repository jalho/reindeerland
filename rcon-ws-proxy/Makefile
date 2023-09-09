CC = gcc
CFLAGS = -Wall -Wextra -Werror -g
SOURCES = main.c rwp-server.c rwp-gateway.c rwp-log.c
OBJECTS = $(SOURCES:.c=.o)
EXECUTABLE = rcon-ws-proxy

all: $(EXECUTABLE)

$(EXECUTABLE): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(EXECUTABLE)
