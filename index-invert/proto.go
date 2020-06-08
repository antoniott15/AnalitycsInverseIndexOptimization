package main

import (
	"context"
	"google.golang.org/grpc"
	proto "indexInverse/protos"

)


func (e *Engine) GetTweets(hashtag, limit string) (*proto.DataResponse, error){
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	c := proto.NewDataEngineClient(conn)

	r, err := c.GiveData(context.Background(), &proto.DataRequest{
		Hashtag:              hashtag,
		Limit:                limit,
	})

	if err != nil {
		return nil, err
	}

	return r, nil
}
