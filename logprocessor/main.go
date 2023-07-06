package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func watchDirectory(directoryPath string, callback func(fsnotify.Event)) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Printf("Error creating watcher: %s\n", err)
		return
	}
	defer watcher.Close()

	err = filepath.Walk(directoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// call the cb with a synthetic create event
		if !info.IsDir() {
			callback(fsnotify.Event{
				Name: path,
				Op:   fsnotify.Create,
			})
		}

		return nil
	})

	if err != nil {
		fmt.Printf("Error accessing directory: %s\n", err)
		return
	}

	done := make(chan bool)

	/*
	 * Spawn separate goroutine to handle events received from the watcher. It
	 * continuously listens for file events and invokes the cb accordingly.
	 */
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				callback(event)
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Printf("Watcher error: %s\n", err)
			}
		}
	}()

	// add the whole directory to the watcher
	err = watcher.Add(directoryPath)
	if err != nil {
		fmt.Printf("Error adding directory to watcher: %s\n", err)
		return
	}

	fmt.Printf("Watching directory: %s\n", directoryPath)

	<-done
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Please provide a directory path.")
		return
	}

	directoryPath := os.Args[1]

	// cb for handling change events
	// TODO: implement further functionality based on what the added content is
	callback := func(event fsnotify.Event) {
		action := "created"
		if event.Op&fsnotify.Write == fsnotify.Write {
			action = "modified"
		}

		fmt.Printf("File %s was %s\n", event.Name, action)
	}

	// start watching
	watchDirectory(directoryPath, callback)
}
