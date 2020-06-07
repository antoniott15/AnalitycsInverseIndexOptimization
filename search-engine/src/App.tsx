import React, {useState, useMemo, useCallback, FunctionComponent} from 'react'
import styled, {createGlobalStyle} from 'styled-components'
import {Container, Row, Col, Form, Button} from 'react-bootstrap'
import {Timeline} from 'react-twitter-widgets'
import {useTable, useBlockLayout} from 'react-table'
import {FixedSizeList} from 'react-window'

import ResponseData from './data/response.json'

const Styles = styled.div`
  padding: 1rem;

  .table {
    border-spacing: 0;
    border: 1px solid white;
    color: white !important;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid white !important;
      border-right: 1px solid white !important;

      :last-child {
        border-right: 0;
      }
    }
  }
`

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

type TableProps = {
    columns: any,
    data: any
}

const Table: FunctionComponent<TableProps> = ({columns, data}) => {

    const defaultColumn = useMemo(() => ({
            width: 150
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        totalColumnsWidth,
        prepareRow
    } = useTable(
        {
            columns,
            data,
            defaultColumn
        },
        useBlockLayout
    )

    const RenderRow = useCallback(
        ({index, style}) => {
            const row = rows[index]
            prepareRow(row)
            return (
                <div
                    {...row.getRowProps({
                        style
                    })}
                    className="tr"
                >
                    {row.cells.map(cell => {
                        return (
                            <div {...cell.getCellProps()} className="td">
                                {cell.render('Cell')}
                            </div>
                        )
                    })}
                </div>
            )
        },
        [prepareRow, rows]
    )

    return (
        <div {...getTableProps()} className="table">
            <div>
                {headerGroups.map(headerGroup => (
                    <div {...headerGroup.getHeaderGroupProps()} className="tr">
                        {headerGroup.headers.map(column => (
                            <div {...column.getHeaderProps()} className="th">
                                {column.render('Header')}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div {...getTableBodyProps()}>
                <FixedSizeList
                    height={400}
                    itemCount={rows.length}
                    itemSize={35}
                    width={totalColumnsWidth}
                >
                    {RenderRow}
                </FixedSizeList>
            </div>
        </div>
    )
}

class Token {
    word: string
    freq: number

    constructor(word: string, freq: number) {
        this.word = word
        this.freq = freq
    }
}

const App = () => {
    const [hashTagInput, setHashTagInput] = useState('')
    const [invertedIndexInput, setInvertedIndexInput] = useState('')

    const compare = ( a: Token, b: Token ) => {
        if ( a.freq > b.freq ){
            return -1;
        }
        if ( a.freq < b.freq ){
            return 1;
        }
        return 0;
    }

    const onSubmit = () => {
        //
    }

    const columns = useMemo(() => [
            {
                Header: 'word',
                accessor: 'word'
            },
            {
                Header: 'freq',
                accessor: 'freq'
            }
        ],
        []
    )

    const data = useMemo(() => {
        const tokensList: Token[] = []
        Object.keys(ResponseData.data.tokens).forEach(key => {
            // @ts-ignore
            tokensList.push(new Token(key, ResponseData.data.tokens[key]))
        })
        tokensList.sort(compare)
        return tokensList
    }, [])

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
                    <Col>
                        <Timeline
                            dataSource={{sourceType: 'profile', screenName: 'realDonaldTrump'}}
                            options={{theme: '', height: '700'}}
                        />
                    </Col>
                    <Col>
                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Hashtag</Form.Label>
                                <CustomInput onChange={((e: any) => setHashTagInput(e.target.value))} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={onSubmit}>
                                Buscar
                            </CustomButton>
                        </Wrapper>

                        <Wrapper>
                            <Form.Group>
                                <Form.Label>Búsqueda por Índice Invertido</Form.Label>
                                <CustomInput onChange={(e: any) => setInvertedIndexInput(e.target.value)} type="text"/>
                            </Form.Group>
                            <CustomButton type="submit" onClick={onSubmit}>
                                Buscar
                            </CustomButton>
                        </Wrapper>
                        <Wrapper>
                            <Styles>
                                <Table columns={columns} data={data}/>
                            </Styles>
                        </Wrapper>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default App;
