
from __future__ import print_function
import service_pb2_grpc
import service_pb2
import grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = service_pb2_grpc.DataEngineStub(channel)
        response = stub.GiveData(service_pb2.DataRequest(hashtag="covid19",limit='10'))
    print(response)


if __name__ == '__main__':
    run()