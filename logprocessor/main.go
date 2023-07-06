package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

type FileState struct {
	Length int64
}

func watchDirectory(directoryPath string, callback func(fsnotify.Event, []byte)) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Printf("Error creating watcher: %s\n", err)
		return
	}
	defer watcher.Close()

	fileStates := make(map[string]*FileState)

	err = filepath.Walk(directoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			fileStates[filepath.Clean(path)] = &FileState{
				Length: info.Size(),
			}
		}

		return nil
	})

	if err != nil {
		fmt.Printf("Error accessing directory: %s\n", err)
		return
	}

	done := make(chan bool)

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}

				if event.Op&fsnotify.Write == fsnotify.Write {
					info, err := os.Stat(event.Name)
					if err != nil {
						fmt.Printf("Error getting file info: %s\n", err)
						continue
					}

					state, ok := fileStates[filepath.Clean(event.Name)]
					if !ok {
						// File state not found, create a new one
						state = &FileState{}
						fileStates[filepath.Clean(event.Name)] = state
					}

					if info.Size() > state.Length {
						content, err := ioutil.ReadFile(event.Name)
						if err != nil {
							fmt.Printf("Error reading file: %s\n", err)
							continue
						}

						additiveContent := content[state.Length:]
						if len(additiveContent) > 0 {
							callback(event, additiveContent)
						}

						// Update the file state
						state.Length = info.Size()
					}
				}

			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Printf("Watcher error: %s\n", err)
			}
		}
	}()

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

	callback := func(event fsnotify.Event, content []byte) {
		fmt.Printf("File %s was modified\n", event.Name)

		fmt.Printf("Additive content: %s\n", string(content))

		// TODO: Implement further functionality based on the added content
	}

	watchDirectory(directoryPath, callback)
}
