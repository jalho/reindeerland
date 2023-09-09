CC = gcc
CFLAGS = -Wall -g
SOURCES = rcon-ws-proxy.h main.c
OBJECTS = $(SOURCES:.c=.o)
EXECUTABLE = rcon-ws-proxy

all: $(EXECUTABLE)

$(EXECUTABLE): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(EXECUTABLE)
