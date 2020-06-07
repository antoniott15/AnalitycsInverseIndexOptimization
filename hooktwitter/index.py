import twint
from datetime import datetime
from concurrent import futures
import service_pb2_grpc
import service_pb2
import asyncio
import grpc
import time

def hook_data(hashtag: str, limit: int = 100) -> [twint.tweet.tweet]:
    c = twint.Config()
    c.Search = hashtag
    c.Limit = limit if limit > 0 else None
    c.Store_object = True
    c.Output = "dat.json"
    twint.run.Search(c)
    tweets = twint.run.output.tweets_list
    twint.run.output.tweets_list = []
    return tweets



class DataEngine(service_pb2_grpc.DataEngineServicer):
    
  def GiveData(self, request: service_pb2.DataRequest, context: grpc.ServicerContext) -> service_pb2.DataResponse:
    hashtag = request.hashtag
    limit = request.limit
    asyncio.set_event_loop(asyncio.new_event_loop())
    data = hook_data(hashtag, int(limit))
    response = service_pb2.DataResponse()
    tweets = []
    for tweet in data:
        t = service_pb2.DataTweet()
        t.id = str(tweet.id)
        t.username = tweet.username
        t.tweet = tweet.tweet
        t.name = tweet.name
        t.hashtags.extend(tweet.hashtags)
        tweets.append(t)
    response.lenght = (len(data))
    response.tweet.extend(tweets)
    return response




def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_DataEngineServicer_to_server(DataEngine(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    print("Connecting...")
    serve()