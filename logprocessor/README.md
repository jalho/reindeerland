# `logprocessor`

`logprocessor` is a Go program that monitors a directory for file modifications and triggers a callback function when changes occur. It provides the ability to react to file changes and process the added content.

## Design

The program is implemented using the Go programming language and utilizes the `fsnotify` package for file system notifications. It follows a simple design that allows users to specify a directory to watch and define a callback function to handle file modifications. The program leverages the `filepath.Walk` function to traverse the directory and initialize the initial state of each file, storing the content for comparison during subsequent modifications.

When a file is modified, the program checks the file's previous state and reads its content. It then compares the previous and new content to determine the added content. If there is any added content, the program invokes the callback function, passing the `fsnotify.Event` and the added content as arguments.

To handle scenarios where new files are added after the initial traversal, the program dynamically creates a file state when encountering new files during the `fsnotify` event handling. This ensures that modifications to newly added files are properly tracked.

## Usage

Run the program, providing the directory path to monitor as a command-line argument. For example:

```
./main /path/to/directory
```
