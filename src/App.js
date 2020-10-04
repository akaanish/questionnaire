import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import './App.css';
import { Form, Row, Col, Spinner, Card, Alert } from 'react-bootstrap';
import { BarChart } from 'reaviz';
import axios from 'axios';

const initState = {
  questions: [],
  score: 0,
  isValid: false
};

const App = () => {

  const [reset, setReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initial, setInitial] = useState(initState);
  const [valid, setValid] = useState(true);
  const [submit, setSubmit] = useState(false);

  const data = [
    { key: 'Correct', data: initial.score },
    { key: 'Incorrect', data: initial.questions.length - initial.score }
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data.json');
      setInitial({ ...initial, questions: response.data.payload })
      setIsLoading(false);
    } catch (error) {
      console.log('error while fetchin api ====');
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  const onValueChange = (qId, e) => {
    const questions = [...initial.questions];
    questions.forEach(element => {
      if (element.questionId === qId) {
        element.response = e.value;
        element.options.forEach((el) => {
          if (el.text === e.value) {
            el.isChecked = e.checked
            element.focus = false;
            if (!e.checked) {
              element.response = '';
            }
          } else {
            el.isChecked = false
          }
        })
      } else {
        if (valid === true && submit === true) {
          element.focus = '';
        }
      }
    });
    setInitial({ ...initial, questions })
    setValid(true)
    setSubmit(false)
  }

  const handelReset = (e) => {
    e.preventDefault();
    setReset(!reset)
    setValid(true)
    setSubmit(false)
  }

  const validations = (questions) => {
    let isValid = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.response === '') {
        isValid = false;
        break;
      }
    }
    return isValid;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let { questions, score } = initial;
    const isValid = validations(questions);
    if (!isValid) {
      setSubmit(false)
      setValid(false)
    } else {
      score = 0;
      questions.forEach(element => {
        if (element.response !== '') {
          if (element.response !== element.answer) {
            element.focus = true;
          }else{
            score = score + 1;
          }
        }
      });
      setInitial({ ...initial, questions, score })
      setSubmit(true)
      setValid(true)
    }
  }

  const renderQnAs = (q, i) => {
    return (
      <Card text={q.focus ? 'white' : 'dark'} className="mb-2" key={i} bg={q.focus ? 'danger' : 'light'}>
        <Card.Header>{`${i + 1}. ${q.question}`}</Card.Header>
        <Card.Body>
          {q.options.map((item, i) => {
            return (
              <Form.Check
                type="checkbox"
                label={item.text}
                value={item.text}
                name="formHorizontalRadios"
                id={i}
                key={i}
                checked={item.isChecked}
                onChange={(e) => onValueChange(q.questionId, e.target)}
              />
            )
          })}
        </Card.Body>
      </Card>
    )
  }

  return (
    <Container className="p-3">
      <Row>
        <Col xs={10}>
          {isLoading && <Spinner animation="border" />}
          {submit === false && valid === false && <Alert key={'idx'} variant={'danger'}>
            Please answer all questions
          </Alert>}
          {initial.questions.length > 0 && initial.questions.map(renderQnAs)}
          <Row>
            <Col>
              <Button type="submit" onClick={(e) => handleSubmit(e)}>Submit</Button>
            </Col>
            <Col>
              <Button type="submit" onClick={(e) => handelReset(e)}>Clear</Button>
            </Col>
          </Row>
        </Col>
        <Col>
          {submit && <BarChart width={100} height={250} data={data} />}
        </Col>
      </Row>
    </Container>
  )
};

export default App;
