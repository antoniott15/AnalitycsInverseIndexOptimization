package index

import (
	"context"
	"google.golang.org/grpc"
	proto "index/protos"
)

const (
	address     = "localhost:50051"
	defaultName = "world"
)

func GetTweets(hashtag, limit string) (*proto.DataResponse, error){
	conn, err := grpc.Dial(address, grpc.WithInsecure(), grpc.WithBlock())
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
