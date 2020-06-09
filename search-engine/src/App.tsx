import React, {useState, useMemo, useCallback, FunctionComponent} from 'react'
import styled, {createGlobalStyle} from 'styled-components'
import {Container, Row, Col, Form, Button} from 'react-bootstrap'
import {Tweet} from 'react-twitter-widgets'
import {FixedSizeList} from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import axios, {AxiosResponse} from 'axios'

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

const CustomButton = styled(Button)`
  background-color: rgb(29, 161, 242);
  border-radius: 9999px;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 0;
  padding-bottom: 0;
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
    const [invertedIndexInput, setInvertedIndexInput] = useState('')
    const tkList: Token[] = []
    const tList: TweetElem[] = []
    const [tokens, setTokens] = useState(tkList)
    const [tweets, setTweets] = useState(tList)

    const compare = (a: Token, b: Token) => {
        if (a.freq > b.freq) {
            return -1;
        }
        if (a.freq < b.freq) {
            return 1;
        }
        return 0;
    }

    const onSubmit = () => {
        //
    }
    const base_url = 'http://localhost:4200/'

    const searchHashTag = async () => {
        const url = base_url + 'api/get-hashtag/' + hashTagInput + '/100'
        await axios.get(url)
            .then((res) => {
                const tokensList: Token[] = []
                const tweetsList: TweetElem[] = []
                Object.keys(res.data.data.tokens).forEach(key => {
                    tokensList.push(new Token(key, res.data.data.tokens[key]))
                })
                tokensList.sort(compare)
                setTokens(tokensList)

                res.data.data.tweets.tweet.forEach((t: any) => {
                    tweetsList.push(new TweetElem(t.id, t.name, t.tweet, t.username))
                })
                setTweets(tweetsList)
            })
            .catch(e => console.log(e))
    }

    const searchInvertedIndex = async () => {
        const url = base_url + 'api/get-index-invert/' + hashTagInput
        await axios.get(url)
            .then((res: AxiosResponse<any>) => {
                console.log(res.data)
            })
    }
    // @ts-ignore
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
                        <TweetsWrapper>
                            {tweets.map(elem => (
                                <Tweet options={{ theme: 'dark'}} tweetId={elem.id}/>
                            ))}
                        </TweetsWrapper>
                    </Col>
                    <Col>
                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Hashtag</Form.Label>
                                <CustomInput onChange={((e: any) => setHashTagInput(e.target.value))} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchHashTag}>
                                Buscar
                            </CustomButton>
                        </Wrapper>

                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Índice Invertido</Form.Label>
                                <CustomInput onChange={(e: any) => setInvertedIndexInput(e.target.value)} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={searchInvertedIndex}>
                                Buscar
                            </CustomButton>
                        </Wrapper>
                        <TableWrapper>
                            <table>
                                <thead>
                                <tr>
                                    <th>Word</th>
                                    <th>Frequency</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tokens.map((data) => {
                                    return (
                                        <tr>
                                            <td>{data.word}</td>
                                            <td>{data.freq}</td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </TableWrapper>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );

}

export default App;
