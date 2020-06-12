import React, { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Container, Row, Col, Form } from 'react-bootstrap'
import { Tweet } from 'react-twitter-widgets'
import { Graph, GraphNode, GraphLink } from "react-d3-graph";

import { myConfig } from "./config"
import axios, { AxiosResponse } from 'axios'
import CircularProgress from '@material-ui/core/CircularProgress';
import {CellMeasurer, List, AutoSizer, Column, Table, ListRowProps, CellMeasurerCache} from 'react-virtualized';
import 'react-virtualized/styles.css';

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
const ReactVirtualized__Table = styled.div`
    display: flex;
    flex-direction: row;
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
    const Defaultdata = {
        nodes: [{id: "No"}, {id: "Data"}],
        links: [{source: "No", target: "Data"}],
    };

    const [data, setData] = useState(Defaultdata)

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

    const filterDuplicates = (w: any) => w.filter((v: any, i: any) => w.indexOf(v) === i)

    const decorateGraphNodesWithInitialPositioning = (nodes: any) => {
        return nodes.map((n: any) =>
            Object.assign({}, n, {
                x: n.x || Math.floor(Math.random() * 500),
                y: n.y || Math.floor(Math.random() * 500),
            })
        );
    };

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
                const nodes: Array<GraphNode> = new Array<GraphNode>();
                const links: Array<GraphLink> = new Array<GraphLink>();


                res.data.data.tweets.tweet.forEach((t: any) => {
                    tweetsList.push(new TweetElem(t.id, t.name, t.tweet, t.username))

                    for (const elements in t.hashtags) {
                        nodes.push({id: t.hashtags[elements]})
                    }

                    if (t.hashtags.length >= 2) {
                        for (let i = 0; i < t.hashtags.length; i++) {
                            for (let j = i + 1; j < t.hashtags.length; j++) {
                                if (t.hashtags[i] !== t.hashtags[j]) {
                                    links.push({source: t.hashtags[i], target: t.hashtags[j]})
                                }
                            }
                        }
                    }

                })

                //@ts-ignore
                const newLinks = links.filter((set => f => !set.has(f.source) && set.add(f.target))(new Set));

                setData({nodes: decorateGraphNodesWithInitialPositioning(filterDuplicates(nodes)), links: newLinks})
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
                const tweetsList: TweetElem[] = []
                res.data.data.tweet.forEach((t: any) => {
                    tweetsList.push(new TweetElem(t.id, t.name, t.tweet, t.username))
                })
                setTweets(tweetsList)
            })
            .catch(e => console.log(e))
        setLoadingInvIndex(false)
    }

    const cache = new CellMeasurerCache({
        defaultHeight: 50,
        fixedWidth: true
    });

    const rowRenderer = (props: ListRowProps) => (

        <CellMeasurer cache={cache} columnIndex={0} key={props.key} parent={props.parent} rowIndex={props.index}>
            {({ measure, registerChild }) => (
                // @ts-ignore
                <div ref={registerChild} style={props.style}>
                    <Tweet onLoad={measure} tweetId={tweets[props.index].id}/>
                </div>
            )}

        </CellMeasurer>
    )

    return (
        <React.Fragment>
            <GlobalStyle/>
            <Container>
                <Row className="justify-content-md-center">
                    <Title>
                        <h1>Base de Datos 2</h1>
                    </Title>
                </Row>
                <Row>
                    <Col style={{overflow: "hidden", position: "relative"}}>
                                <List
                                    deferredMeasurementCache={cache}
                                    rowCount={tweets.length}
                                    rowHeight={cache.rowHeight}
                                    width={500}
                                    height={800}
                                    rowRenderer={rowRenderer}/>
                            )}
                        {/*
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
                        */}
                    </Col>
                    <Col>
                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Hashtag</Form.Label>
                                <CustomInput onChange={((e: any) => setHashTagInput(e.target.value))} type="text"/>
                                <Form.Label>Cantidad</Form.Label>
                                <CustomInput onChange={((e: any) => setnumberOfRequests(e.target.value))} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchHashTag}>
                                {!loadingHashTag && <span>Buscar</span>}
                                {loadingHashTag && <CircularProgress color="secondary"/>}
                            </CustomButton>
                        </Wrapper>

                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Índice Invertido</Form.Label>
                                <CustomInput onChange={(e: any) => setInvertedIndexInput(e.target.value)} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchInvertedIndex}>
                                {!loadingInvIndex && <span>Buscar</span>}
                                {loadingInvIndex && <CircularProgress color="secondary"/>}
                            </CustomButton>
                        </Wrapper>
                        <AutoSizer>
                            {({width}) => (
                                <Table
                                    width={500}
                                    height={400}
                                    headerHeight={50}
                                    rowHeight={50}
                                    rowCount={tokens.length}
                                    rowGetter={({index}) => tokens[index]}
                                >
                                    <Column label="word" dataKey="word" width={150}/>
                                    <Column label="freq" dataKey="freq" width={150}/>
                                </Table>
                            )}
                        </AutoSizer>
                    </Col>
                </Row>
            </Container>

            <Container style={{height: "500px"}}>
                <Graph
                    id="graph-id"
                    data={data}
                    config={myConfig}
                />

            </Container>
        </React.Fragment>
    );

}

export default App;
