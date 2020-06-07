import React, {useState} from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import {Container, Row, Col, Form, Button} from 'react-bootstrap';

const GlobalStyle = createGlobalStyle`
  body {
    margin-top: 100px;
    background-color: rgb(21, 32, 43);
    color: #fff;
  }
`;

const Wrapper = styled.div`
  margin-top: 50px;
  margin-bottom: 50px;
`;

const App = () => {
    const [hashTagInput, setHashTagInput] = useState('');
    const [invertedIndexInput, setInvertedIndexInput] = useState('');

    const onSubmit = () => {
        console.log(hashTagInput)
        console.log(invertedIndexInput)
    }

    return (
        <React.Fragment>
            <GlobalStyle/>
            <Container>
                <Row className="justify-content-md-center">
                    <h1>Base de Datos 2</h1>
                </Row>
                <Row>
                    <Col>1 of 2</Col>
                    <Col>
                        <Wrapper>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Busqueda por Hashtag</Form.Label>
                                <Form.Control onChange={(e => setHashTagInput(e.target.value))} type="text"/>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={onSubmit}>
                                Submit
                            </Button>
                        </Wrapper>

                        <Wrapper>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Busqueda por Indice Invertido</Form.Label>
                                <Form.Control onChange={e => setInvertedIndexInput(e.target.value)} type="text"/>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={onSubmit}>
                                Submit
                            </Button>
                        </Wrapper>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default App;
