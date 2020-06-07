package main

import (
	"bufio"
	"fmt"
	proto "indexInverse/protos"
	"io"
	"os"
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



func (e *Engine) getTokens(list []*proto.DataTweet) map[string]int {

}