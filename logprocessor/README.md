## File Watcher

This is a simple file watcher program implemented in Go that monitors a specified directory for file changes using the `fsnotify` package. When a new file is created or an existing file is modified within the directory, it invokes a callback function and provides information about the event.

### How It Works

1. The program starts by checking if a directory path is provided as a command-line argument. If no path is provided, it prints a message requesting a directory path and exits.

2. The `watchDirectory` function is responsible for setting up the file watcher and handling the events.

   - It creates a new `fsnotify.Watcher` instance to monitor file events.

   - It walks through the specified directory recursively using the `filepath.Walk` function. For each file encountered, it checks if it's not a directory and calls the provided callback function with a synthetic create event.

   - If any errors occur during directory access or event processing, appropriate error messages are printed.

   - A separate goroutine is spawned to handle events received from the watcher. It continuously listens for file events and invokes the callback function accordingly. If any errors occur while watching for events, they are printed.

   - Finally, the directory is added to the watcher, and the function waits for a signal on the `done` channel to keep the program running.

3. In the `main` function, a callback function is defined to handle file events. It prints information about the file that was created or modified.

4. The `watchDirectory` function is called with the provided directory path and the defined callback function to initiate the file monitoring.

### How It's Designed

The program is designed to provide a simple file watching functionality in Go. It follows a modular approach, encapsulating the file watching logic within the `watchDirectory` function and utilizing the `fsnotify` package for event handling.

The `watchDirectory` function takes a directory path and a callback function as parameters. It sets up the file watcher, walks through the directory to handle existing files, and continuously listens for file events using a goroutine. It also handles errors related to the watcher and directory access.

The `main` function serves as the entry point of the program. It checks for the presence of a directory path and defines the callback function to be executed when file events occur. It then calls the `watchDirectory` function with the provided directory path and callback to initiate the file monitoring.
