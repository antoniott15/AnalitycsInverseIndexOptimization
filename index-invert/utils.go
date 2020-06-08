package main

import (
	"os"
	"path/filepath"
)

func WalkDir(root string) (files []string) {
	if err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		files = append(files, path)
		return nil
	}); err != nil {
		return nil
	}

	return
}