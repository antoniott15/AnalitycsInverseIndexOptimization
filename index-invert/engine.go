package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	proto "indexInverse/protos"
	"os"
	"strings"
)

type Engine struct {
	Query map[string]string
}

func (e *Engine) save(name string, list []*proto.DataTweet) error {
	os.Mkdir(name, 0777)
	totalLen := len(list) / 10

	for i := 1; i < 10; i++ {
		file, err := os.OpenFile(getFilePaginated(name, i), os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
		err = os.Chmod(getFilePaginated(name, i), 0777)

		if err != nil {
			return err
		}
		defer file.Close()
		c := bufio.NewWriter(file)

		var wordlist []*proto.DataTweet

		for j := totalLen * i; j < totalLen*(i+1); j++ {
			if j < totalLen*(i+1) {
				wordlist = append(wordlist, list[j])
			}
			if j == totalLen*(i+1) {
				break
			}
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
	}

	return nil

}

func (e *Engine) saveInitial(name string, list []*proto.DataTweet) error {
	os.Mkdir(name, 0777)
	totalLen := len(list) / 10

	i := 0
	file, err := os.OpenFile(getFilePaginated(name, i), os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
	err = os.Chmod(getFilePaginated(name, i), 0777)

	if err != nil {
		return err
	}
	defer file.Close()
	c := bufio.NewWriter(file)

	var wordlist []*proto.DataTweet

	for j := totalLen * i; j < totalLen*(i+1); j++ {
		if j < totalLen*(i+1) {
			wordlist = append(wordlist, list[j])
		}
		if j == totalLen*(i+1) {
			break
		}
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

func (e *Engine) saveIndexInvertInitial(fileName string, list map[string]*WordList) error {
	os.Mkdir(fileName, 0777)
	totalLen := len(list) / 10
	i := 0

	file, err := os.OpenFile(getFilePaginated(fileName, i), os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
	err = os.Chmod(getFilePaginated(fileName, i), 0777)

	if err != nil {
		return err
	}
	defer file.Close()
	c := bufio.NewWriter(file)

	var wordlist []*WordList

	j := totalLen * i
	for _, elements := range list {
		if j < totalLen*(i+1) {
			wordlist = append(wordlist, elements)
		}
		if j == totalLen*(i+1) {
			break
		}
		j++
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

func (e *Engine) saveIndexInvert(fileName string, list map[string]*WordList) error {
	totalLen := len(list) / 10
	for i := 1; i < 10; i++ {

		file, err := os.OpenFile(getFilePaginated(fileName, i), os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModeAppend)
		err = os.Chmod(getFilePaginated(fileName, i), 0777)

		if err != nil {
			return err
		}
		defer file.Close()
		c := bufio.NewWriter(file)

		var wordlist []*WordList

		j := totalLen * i
		for _, elements := range list {
			if j < totalLen*(i+1) {
				wordlist = append(wordlist, elements)
			}
			if j == totalLen*(i+1) {
				break
			}
			j++
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
	}

	return nil
}

func getFilePaginated(fileName string, i int) string {
	return fileName + "/" + fmt.Sprint(i) + ".json"
}

func getFilePaginatedString(fileName string, i string) string {
	return fileName + "/" + i + ".json"
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
		} else if strings.Contains(values.Tweet[1:], "#") {
			sep = "#"
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
	var tweets [][]*proto.DataTweet

	for i := 0; i < 10; i++ {
		r, _ := os.Open(getFilePaginated(file, i))

		decoder := json.NewDecoder(r)
		var tweet []*proto.DataTweet
		decoder.Decode(&tweet)

		tweets = append(tweets, tweet)

	}

	var res []*proto.DataTweet
	for _, elements := range tweets {
		for _, values := range elements {
			res = append(res, values)
		}
	}
	tokens, err := e.getTokens(res)

	if err != nil {
		return nil, nil, err
	}
	return &proto.DataResponse{
		Tweet:  res,
		Lenght: int32(len(tweets)),
	}, tokens, nil

}

func (e *Engine) getTweetsByFile(file string) (*proto.DataResponse, error) {
	var allTweets [][]*proto.DataTweet
	for i:=0; i < 10; i++ {
		r, err := os.Open(getFilePaginated(file,i))
		if err != nil {
			return nil, err
		}

		decoder := json.NewDecoder(r)

		var pTweets []*proto.DataTweet
		err = decoder.Decode(&pTweets)
		if err != nil {
			return nil, err
		}

		allTweets = append(allTweets, pTweets)
	}

	var tweets []*proto.DataTweet

	for _, elements := range allTweets {
		for _, values := range elements {
			tweets = append(tweets, values)
		}
	}

	return &proto.DataResponse{
		Tweet:  tweets,
		Lenght: int32(len(tweets)),
	}, nil

}

func (e *Engine) getIndexInvertByName(file string) ([]*WordList, error) {
	var words [][]*WordList
	for i:=0;i < 10; i++ {
		r, err := os.Open(getFilePaginated(file,i))
		if err != nil {
			return nil, err
		}

		decoder := json.NewDecoder(r)
		var wordListIndex []*WordList
		if err := decoder.Decode(&wordListIndex); err != nil {
			return nil, err
		}
		words = append(words, wordListIndex)
	}

	var wordIndex []*WordList
	for _,elements := range words {
		for _, values := range elements {
			wordIndex = append(wordIndex, values)
		}
	}
	return wordIndex, nil
}

func (e *Engine) CleanWord(word string) string {
	chars := []string{"!", "@", ".", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "?", "¿", "*", "}", "\n", " ", "\t", "¡", "^", "]", "[", ":", ";", "-", "_", ",", "\"", "'", "(", ")"}
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


func (e* Engine) GetListPaginated(file, page string) (*proto.DataResponse,error) {
	r, err := os.Open(getFilePaginatedString(file,page))
	if err != nil {
		return nil, err
	}

	decoder := json.NewDecoder(r)
	var tweets []*proto.DataTweet

	if err := decoder.Decode(&tweets); err != nil {
		return nil, err
	}
	total := len(tweets)
	return &proto.DataResponse{
		Tweet:                tweets,
		Lenght:               int32(total),
	}, nil
}