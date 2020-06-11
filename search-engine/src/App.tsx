import React, { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Tweet } from 'react-twitter-widgets'
import axios, { AxiosResponse } from 'axios'
import CircularProgress from '@material-ui/core/CircularProgress';
import { AutoSizer, Column, Table } from 'react-virtualized'

const GlobalStyle = createGlobalStyle`
  body {
    background-color: rgb(21, 32, 43);
    color: #fff;
    font-family: 'Quicksand', sans-serif;
  }
`

const Wrapper = styled.div`
  margin-bottom: 100px;
`

const Title = styled.div`
  margin-top: 50px;
  margin-bottom: 50px;
`

const TableInfoWrapper = styled.div`
    display: flex;
    justify-content: center;
    top: 10rem;
`
const CustomButton = styled(Button)`
  background-color: rgb(29, 161, 242);
  border-radius: 9999px;
  padding-left: 30px;
  padding-right: 30px;
  box-shadow: rgba(0, 0, 0, 0.08) 0 8px 28px;
  border-color: rgb(0, 0, 0, 0);
  min-width: 200px;
  font-size: 15px;
  min-height: 49px;
  float: right;
`

const CustomInput = styled(Form.Control)`
  background-color: rgb(21, 32, 43) !important;
  color: white;
  border-color: rgb(56, 68, 77);
  
  :focus {
    color: white;
  }
`

const TableWrapper = styled.div`
  max-height: 300px;
  overflow-y: scroll;
    td {
        max-width: 400px;
        overflow: auto;
        border: 1px solid white;
        padding: 10px;
      }
      
      th {
      border: 1px solid white;
      width: 100%;
      padding: 10px;
      }
`

const TweetsWrapper = styled.div`
  position: absolute;
  height: 100%;
  overflow-y: scroll;
`

class Token {
    word: string
    freq: number

    constructor(word: string, freq: number) {
        this.word = word
        this.freq = freq
    }
}

class TweetElem {
    id: string
    name: string
    tweet: string
    username: string

    constructor(id: string, name: string, tweet: string, username: string) {
        this.id = id
        this.name = name
        this.tweet = tweet
        this.username = username
    }
}

type Node = {
    id: string,
}
type Link = {
    source: string,
    target: string,
}

interface Data  {
    nodes: Set<Node>
    links: Array<Link>
}

const App = () => {
    const [hashTagInput, setHashTagInput] = useState('')
    const [numberOfRequests, setnumberOfRequests] = useState()
    const [invertedIndexInput, setInvertedIndexInput] = useState('')
    const tkList: Token[] = [
        new Token('hello', 5)
    ]
    const tList: TweetElem[] = []
    const [tokens, setTokens] = useState(tkList)
    const [tweets, setTweets] = useState(tList)
    const [loadingHashTag, setLoadingHashTag] = useState(false)
    const [tableInfo, setTableInfo] = useState(false)
    const [loadingInvIndex, setLoadingInvIndex] = useState(false)


    const compare = (a: Token, b: Token) => {
        if (a.freq > b.freq) {
            return -1;
        }
        if (a.freq < b.freq) {
            return 1;
        }
        return 0;
    }

    const base_url = 'http://localhost:4200/'

    const searchHashTag = async () => {
        setLoadingHashTag(true)
        setTableInfo(false)
        const url = base_url + 'api/get-hashtag/' + hashTagInput + '/' + numberOfRequests
        await axios.get(url)
            .then((res) => {
                setTableInfo(true)
                const tokensList: Token[] = []
                const tweetsList: TweetElem[] = []
                Object.keys(res.data.data.tokens).forEach(key => {
                    tokensList.push(new Token(key, res.data.data.tokens[key]))
                })
                tokensList.sort(compare)
                setTokens(tokensList)
                // const graph: Data = {
                //     nodes: new Set<Node>(),
                //     links: []
                // };
                res.data.data.tweets.tweet.forEach((t: any) => {
                    tweetsList.push(new TweetElem(t.id, t.name, t.tweet, t.username))

                    // for(const elements in t.hashtags){
                    //     graph.nodes.add(t.hashtags[elements])
                    // }
                    // for(let i = 0; i < t.hashtags.lenght; i++){
                    //     for(let j = i + 1; j < t.hashtags.lenght - 1; j++){
                    //
                    //     }
                    // }
                })
                setTweets(tweetsList)
                setLoadingHashTag(false)
            })
            .catch(e => console.log(e))

    }

    const searchInvertedIndex = async () => {
        setLoadingInvIndex(true)
        const url = base_url + 'api/get-index-invert/' + hashTagInput
        var words = invertedIndexInput.replace(/\s+/g, ' ')
        var wordList: string[] = words.split(' ')
        await axios.post(url, {
            data: wordList
        })
            .then((res: AxiosResponse<any>) => {
                console.log(res.data)
                const tweetsList: TweetElem[] = []
                res.data.data.tweet.forEach((t: any) => {
                    tweetsList.push(new TweetElem(t.id, t.name, t.tweet, t.username))
                })
                setTweets(tweetsList)
            })
            .catch(e => console.log(e))
        setLoadingInvIndex(false)
    }
    // @ts-ignore
    return (
        <React.Fragment>
            <GlobalStyle />
            <Container>
                <Row className="justify-content-md-center">
                    <Title>
                        <h1>Base de Datos 2</h1>
                    </Title>
                </Row>
                <Row>
                    <Col style={{ overflow: "hidden", position: "relative" }}>
                        {
                            tableInfo ? (
                                <TweetsWrapper>
                                    {tweets.map(elem => (
                                        <Tweet options={{ theme: 'dark' }} tweetId={elem.id} />
                                    ))}
                                </TweetsWrapper>
                            ) : (
                                    loadingHashTag ? (
                                        <TableInfoWrapper style={{ marginTop: "10rem" }}>
                                            <Form.Label>... Loading</Form.Label>
                                        </TableInfoWrapper>

                                    ) : (
                                            <TableInfoWrapper style={{ marginTop: "10rem" }}>
                                                <Form.Label>No data</Form.Label>
                                            </TableInfoWrapper>
                                        )
                                )
                        }
                    </Col>
                    <Col>
                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Hashtag</Form.Label>
                                <CustomInput onChange={((e: any) => setHashTagInput(e.target.value))} type="text" />
                                <Form.Label>Cantidad</Form.Label>
                                <CustomInput onChange={((e: any) => setnumberOfRequests(e.target.value))} type="text" />
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchHashTag}>
                                {!loadingHashTag && <span>Buscar</span>}
                                {loadingHashTag && <CircularProgress color="secondary" />}
                            </CustomButton>
                        </Wrapper>

                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Índice Invertido</Form.Label>
                                <CustomInput onChange={(e: any) => setInvertedIndexInput(e.target.value)} type="text" />
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchInvertedIndex}>
                                {!loadingInvIndex && <span>Buscar</span>}
                                {loadingInvIndex && <CircularProgress color="secondary" />}
                            </CustomButton>
                        </Wrapper>
                        <AutoSizer disableHeight disableWidth>
                            {({width}) => (
                                <Table
                                    width={300}
                                    height={300}
                                    headerHeight={100}
                                    rowHeight={100}
                                    rowCount={tokens.length}
                                    rowGetter={({ index }) => tokens[index]}
                                >
                                    <Column label="word" dataKey="word" width={150} />
                                    <Column label="freq" dataKey="freq" width={150} />
                                </Table>
                            )}
                        </AutoSizer>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );

}

export default App;
