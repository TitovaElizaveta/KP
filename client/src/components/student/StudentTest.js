import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Alert, ListGroup, Row, Col, Badge } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { startTest, saveAnswer, submitTest } from '../../http/student/testAPI'

const StudentTest = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [testData, setTestData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const initializeTest = async () => {
      try {
        const data = await startTest(testId)
        setTestData(data)
        setTimeLeft(data.timeLimit * 60)
      } catch (error) {
        setError(error.response?.data?.message || 'Ошибка при начале теста')
      }
    }

    initializeTest()
  }, [testId])

  useEffect(() => {
    if (timeLeft <= 0 || !testData) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, testData])

  const handleAnswerChange = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers)
    try {
      await saveAnswer(testData.attemptId, questionId, answer)
    } catch (error) {
      console.error('Ошибка при сохранении ответа:', error)
    }
  }

  const handleSubmitTest = async () => {
    try {
      await submitTest(testData.attemptId)
      navigate(`/student/tests/${testId}/results`)
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при завершении теста')
    }
  }

  if (!testData) {
    return (
      <Container>
        <div className="text-center py-5">
          {error ? error : 'Загрузка теста...'}
        </div>
      </Container>
    )
  }

  const question = testData.questions[currentQuestion]

  return (
    <Container>
      <div style={{ marginLeft: '140px' }} className="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <div className="text-center" >
          <h4>Вопрос {currentQuestion + 1} из {testData.questions.length}</h4>
          <Badge bg="warning" text="dark">
            Осталось времени: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
        <Button variant="primary" onClick={handleSubmitTest}>
          Завершить тест
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card style={{ maxWidth: '1000px', marginLeft: '155px' }}>
        <Card.Header>
          <h5>{question.text}</h5>
          <div className="d-flex gap-2 mt-2">
            <span>Балл(ов): {question.points}</span>
          </div>
        </Card.Header>
        <Card.Body>
          {renderQuestion(question, answers[question.id] || '', handleAnswerChange)}
        </Card.Body>
      </Card>

      <div style={{ maxWidth: '1000px', marginLeft: '155px' }} className="d-flex justify-content-between mt-4">
        <Button variant="outline-primary" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(prev => prev - 1)}>
          Предыдущий вопрос
        </Button>
        <Button variant="primary" disabled={currentQuestion === testData.questions.length - 1}
          onClick={() => setCurrentQuestion(prev => prev + 1)}
        >
          Следующий вопрос
        </Button>
      </div>
    </Container>
  )
}

const renderQuestion = (question, answer, onChange) => {
  switch (question.type) {
    case 'single':
      return (
        <ListGroup variant="flush">
          {question.options.map(option => (
            <ListGroup.Item key={option.id}>
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answer === option.id}
                onChange={() => onChange(question.id, option.id)}
                className="me-2"
              />
              {option.text}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )
    case 'many':
      const currentAnswer = Array.isArray(answer) ? answer : [];
      return (
        <ListGroup variant="flush">
          {question.options.map(option => (
            <ListGroup.Item key={option.id}>
              <input
                type="checkbox"
                checked={currentAnswer.includes(option.id)}
                onChange={(e) => {
                  const newAnswer = e.target.checked
                    ? [...currentAnswer, option.id]
                    : currentAnswer.filter(id => id !== option.id);
                  onChange(question.id, newAnswer);
                }}
                className="me-2"
              />
              {option.text}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )
    case 'write':
      return (
        <textarea className="form-control" rows={4}
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="Введите ваш ответ..."
        />
      )
    case 'match':
      return (
        <MatchQuestion question={question} answer={answer} onChange={onChange} />
      )
    default:
      return <div>Неизвестный тип вопроса</div>
  }
}

const MatchQuestion = ({ question, answer, onChange }) => {
  const [matches, setMatches] = useState({})

  useEffect(() => {
    if (answer && answer.trim()) {
      const savedMatches = {}
      answer.split(',').forEach(pair => {
        const [leftIdx, rightChar] = pair.trim().split('-')
        if (leftIdx && rightChar) {
          const rightIdx = rightChar.charCodeAt(0) - 65
          savedMatches[parseInt(leftIdx) - 1] = rightIdx
        }
      })
      setMatches(savedMatches)
    }
  }, [answer])

  const handleMatch = (leftIndex, rightIndex) => {
    const newMatches = { ...matches, [leftIndex]: rightIndex }
    setMatches(newMatches)

    const answerString = Object.entries(newMatches)
      .map(([leftIdx, rightIdx]) => `${parseInt(leftIdx) + 1}-${String.fromCharCode(65 + rightIdx)}`)
      .join(', ');

    onChange(question.id, answerString)
  }

  const removeMatch = (leftIndex) => {
    const newMatches = { ...matches }
    delete newMatches[leftIndex]
    setMatches(newMatches)

    const answerString = Object.entries(newMatches)
      .map(([leftIdx, rightIdx]) => `${parseInt(leftIdx) + 1}-${String.fromCharCode(65 + rightIdx)}`)
      .join(', ')

    onChange(question.id, answerString)
  }

  if (!question.matchPairs) {
    return <Alert variant="warning">Данные для вопроса не найдены</Alert>
  }

  const leftItems = question.matchPairs.leftItems?.split(',').map(item => item.trim()) || []
  const rightItems = question.matchPairs.rightItems?.split(',').map(item => item.trim()) || []

  return (
    <div className="match-question">
      <Row>
        <Col md={6}>
          <h6>Левый столбец:</h6>
          {leftItems.map((item, index) => (
            <div key={index} className="left-item mb-2 p-2 border rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span>{index + 1}. {item}</span>
                {matches[index] !== undefined && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeMatch(index)}>
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Col>

        <Col md={6}>
          <h6>Правый столбец:</h6>
          {rightItems.map((item, index) => (
            <div key={index} className="right-item mb-2 p-2 border rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span>{String.fromCharCode(65 + index)}. {item}</span>
                <Button variant="outline-primary" size="sm"
                  onClick={() => handleMatch(
                    Object.keys(matches).find(key => matches[key] === index) !== undefined
                      ? Object.keys(matches).find(key => matches[key] === index)
                      : Object.keys(matches).length < leftItems.length ? Object.keys(matches).length : 0,
                    index
                  )}
                >
                  Сопоставить
                </Button>
              </div>
            </div>
          ))}
        </Col>
      </Row>

      <div className="mt-3 p-3 bg-light rounded">
        <h6>Текущие соответствия:</h6>
        {Object.keys(matches).length > 0 ? (
          <div>
            {Object.entries(matches).map(([leftIdx, rightIdx]) => (
              <span key={leftIdx} bg="info" className="me-2 mb-2">
                {parseInt(leftIdx) + 1} → {String.fromCharCode(65 + rightIdx)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted">Нет установленных соответствий</span>
        )}
      </div>
    </div>
  )
}

export default StudentTest