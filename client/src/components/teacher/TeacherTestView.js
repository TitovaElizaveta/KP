import React, { useState, useEffect } from 'react'
import { Container, Card, Alert, ListGroup } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { getTestById } from '../../http/teacher/testAPI'

const TeacherTestView = () => {
  const { testId } = useParams()
  const [test, setTest] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getTestById(testId)
        setTest(data)
      } catch (error) {
        setError('Ошибка при загрузке теста')
        console.error('Error fetching test:', error)
      }
    }
    fetchTest()
  }, [testId])

  if (!test) {
    return (
      <Container>
        <div className="text-center py-5">Загрузка теста...</div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4 ">
        <h1>Просмотр теста</h1>
        <div></div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h3 className="mb-0">{test.title}</h3>
        </Card.Header>
        <Card.Body>
          {test.description && (
            <p className="mb-3">{test.description}</p>
          )}
          <div className="d-flex gap-2">
            <div>Время: {test.timeLimit} мин.</div>
            <div>Вопросов: {test.questions?.length || 0}</div>
          </div>
        </Card.Body>
      </Card>

      <Card className='border-0'>
        
        <Card.Body className='p-0'>
          {test.questions && test.questions.length > 0 ? (
            test.questions.map((question, index) => (
              <Card key={question.id} className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Вопрос {index + 1}</strong>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3">{question.text}</p>

                  {(question.type === 'single' || question.type === 'many') && (
                    <ListGroup variant="flush">
                      {question.answerOptions && question.answerOptions.map((option, optIndex) => (
                        <ListGroup.Item
                          key={option.id}
                          className={`d-flex align-items-center ${option.isCorrect ? 'bg-success bg-opacity-10' : ''}`}
                        >
                          <div className="me-2">
                            {option.isCorrect ? '+' : '-'}
                          </div>
                          {option.text}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}

                  {question.type === 'write' && question.correctWrite && (
                    <div className="border p-3 bg-light rounded">
                      <strong>Правильный ответ:</strong>
                      <p className="mb-0 mt-2">{question.correctWrite.correctText}</p>
                    </div>
                  )}

                  {question.type === 'match' && question.matchPairs && question.matchPairs[0] && (
                    <div className="border p-3 bg-light rounded">
                      <strong>Пары для соответствия:</strong>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <strong>Левый столбец:</strong>
                          <ul className="mb-0">
                            {question.matchPairs[0].leftItems &&
                              question.matchPairs[0].leftItems.split(',').map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))
                            }
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <strong>Правый столбец:</strong>
                          <ul className="mb-0">
                            {question.matchPairs[0].rightItems &&
                              question.matchPairs[0].rightItems.split(',').map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 text-muted">
              В тесте нет вопросов
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default TeacherTestView