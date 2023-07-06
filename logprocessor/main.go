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

	// Käy läpi hakemiston tiedostot rekursiivisesti
	err = filepath.Walk(directoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Jos kyseessä ei ole hakemisto, kutsu annettua callback-funktiota
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

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				// Kutsu annettua callback-funktiota kun tapahtuma havaitaan
				callback(event)
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Printf("Watcher error: %s\n", err)
			}
		}
	}()

	// Lisää hakemisto tarkkailijaan
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

	// Callback-funktio, joka tulostaa tapahtuman tiedot
	callback := func(event fsnotify.Event) {
		action := "created"
		if event.Op&fsnotify.Write == fsnotify.Write {
			action = "modified"
		}

		fmt.Printf("File %s was %s\n", event.Name, action)
	}

	// Käynnistä hakemiston tarkkailu
	watchDirectory(directoryPath, callback)
}
