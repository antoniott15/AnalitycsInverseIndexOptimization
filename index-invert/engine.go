package main

import (
	"bufio"
	"encoding/json"
	proto "indexInverse/protos"
	"os"
	"strings"
)

type Engine struct {
	Query map[string]string
}

func (e *Engine) save(name string, list []*proto.DataTweet) error {
	file, err := os.OpenFile(name, os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
	err = os.Chmod(name, 0777)
	if err != nil {
		return err
	}
	defer file.Close()

	c := bufio.NewWriter(file)

	elem, err := json.MarshalIndent(list, "", "\t")
	if err != nil {
		return err
	}
	_, err = c.Write(elem)
	if err != nil {
		return err
	}

	c.Flush()
	return nil

}

func (e *Engine) saveIndexInvert(fileName string, list map[string]*WordList) error {
	file, err := os.OpenFile(fileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
	err = os.Chmod(fileName, 0777)

	if err != nil {
		return err
	}
	defer file.Close()
	c := bufio.NewWriter(file)

	var wordlist []*WordList
	for _, elements := range list {
		wordlist = append(wordlist, elements)
	}

	elem, err := json.MarshalIndent(wordlist, "", "\t")
	if err != nil {
		return err
	}
	_, err = c.Write(elem)
	if err != nil {
		return err
	}

	c.Flush()
	return nil

}

func getStopWords(file string) (map[string]bool, error) {
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
	for _, values := range list {
		for _, words := range strings.Split(values.Tweet, " ") {
			words = e.CleanWord(words)
			if _, ok := stopWords[words]; !ok {
				if words != "" {
					if _, ok := tokens[words]; ok {
						tokens[words] = tokens[words] + 1
					} else {
						tokens[words] = 1
					}
				}
			}
		}
	}
	return tokens, nil
}

type WordList struct {
	Name         string   `json:"name"`
	Count        int      `json:"count"`
	IdsAppearing []string `json:"ids_appearing"`
}

func (e *Engine) getIndexInvert(list []*proto.DataTweet) (map[string]*WordList, map[string]int, error) {
	tokens := make(map[string]*WordList)
	tokensNot := make(map[string]int)
	stopWords, err := getStopWords(STOPWORDS)
	if err != nil {
		return nil, nil, err
	}
	for _, values := range list {
		var sep string
		if strings.Contains(values.Tweet, "\n") {
			sep = "\n"
		} else {
			sep = " "
		}
		for _, words := range strings.Split(values.Tweet, sep) {
			words = e.CleanWord(words)
			if _, ok := stopWords[words]; !ok {
				if words != "" {
					if _, ok := tokens[words]; ok {
						tokensNot[words] = tokensNot[words] + 1
						c := tokens[words]
						c.IdsAppearing = append(c.IdsAppearing, values.Id)
						tokens[words] = &WordList{
							Name:         words,
							Count:        c.Count + 1,
							IdsAppearing: c.IdsAppearing,
						}
					} else {
						tokensNot[words] = 1
						tokens[words] = &WordList{
							Name:         words,
							Count:        1,
							IdsAppearing: []string{values.Id},
						}
					}
				}
			}
		}
	}
	return tokens, tokensNot, nil
}

func (e *Engine) getTokenAndTweetsByFile(file string) (*proto.DataResponse, map[string]int, error) {
	r, err := os.Open(file)
	if err != nil {
		return nil, nil, err
	}

	decoder := json.NewDecoder(r)

	var tweets []*proto.DataTweet
	err = decoder.Decode(&tweets)
	if err != nil {
		return nil, nil, err
	}

	tokens, err := e.getTokens(tweets)
	if err != nil {
		return nil, nil, err
	}

	return &proto.DataResponse{
		Tweet:  tweets,
		Lenght: int32(len(tweets)),
	}, tokens, nil

}

func (e *Engine) getTweetsByFile(file string) (*proto.DataResponse, error) {
	r, err := os.Open(file)
	if err != nil {
		return nil, err
	}

	decoder := json.NewDecoder(r)

	var tweets []*proto.DataTweet
	err = decoder.Decode(&tweets)
	if err != nil {
		return nil, err
	}

	return &proto.DataResponse{
		Tweet:  tweets,
		Lenght: int32(len(tweets)),
	}, nil

}

func (e *Engine) getIndexInvertByName(file string) ([]*WordList, error) {
	r, err := os.Open(file)
	if err != nil {
		return nil, err
	}

	decoder := json.NewDecoder(r)
	var wordListIndex []*WordList
	if err := decoder.Decode(&wordListIndex); err != nil {
		return nil, err
	}
	return wordListIndex, nil
}

func (e *Engine) CleanWord(word string) string {
	chars := []string{"!", "@", ".", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "?", "¿", "*", "}", "\n", " ", "\t", "¡", "^", "]", "[", ":", ";", "-", "_", ",", "\"", "'"}
	var newWord string
	for i, elements := range chars {
		if i == 0 {

			newWord = strings.ReplaceAll(word, elements, "")
		} else {
			newWord = strings.ReplaceAll(newWord, elements, "")
		}
	}
	return newWord
}
