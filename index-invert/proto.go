package main

import (
	"context"
	"google.golang.org/grpc"
	proto "indexInverse/protos"
	"time"
)


func (e *Engine) GetTweets(hashtag, limit string) (*proto.DataResponse, error){
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	c := proto.NewDataEngineClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	r, err := c.GiveData(ctx, &proto.DataRequest{
		Hashtag:              hashtag,
		Limit:                limit,
	})

	if err != nil {
		return nil, err
	}

	return r, nil
}
