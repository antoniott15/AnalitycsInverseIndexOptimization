package main

import (
	"bufio"
	"fmt"
	proto "indexInverse/protos"
	"io"
	"os"
	"strings"
)

type Engine struct {
}



func (e *Engine) save(name string, list []*proto.DataTweet) error {
	file, err := os.OpenFile(name, os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
	err = os.Chmod(name, 0777)
	if err != nil {
		fmt.Println(err)
	}
	if err != nil {
		return err
	}
	defer file.Close()
	dataWrite := bufio.NewWriter(file)
	for _,elements := range list {
		fmt.Println(elements)
		io.WriteString(dataWrite, fmt.Sprintf("%+v\n", elements))
	}
	dataWrite.Flush()
	return nil

}

func getStopWords(file string) ( map[string]bool, error) {
	rawFile, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer rawFile.Close()

	scanner := bufio.NewScanner(rawFile)

	words := make(map[string]bool)
	scanner.Split(bufio.ScanWords)
	for scanner.Scan() {
		words[scanner.Text()] = true
	}

	return words, nil

}

func (e *Engine) getTokens(list []*proto.DataTweet) (map[string]int, error) {
	tokens := make(map[string]int)
	stopWords, err := getStopWords(STOPWORDS)
	if err != nil {
		return nil, err
	}
	for _,values := range list {
		for _, words := range strings.Split(values.Tweet, " ")  {
			words := strings.ReplaceAll(words, "\n","")
			words = strings.ReplaceAll(words, "!","")
			words = strings.ReplaceAll(words, "\"","")
			if _, ok := stopWords[words]; !ok {
				if words != "" {
					if _, ok := tokens[words]; ok {
						tokens[words] = tokens[words] + 1
					}else {
						tokens[words] = 1
					}
				}
			}
		}
	}
	return tokens, nil
}