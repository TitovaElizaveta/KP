import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { getTestResults } from '../../http/student/testAPI'

const TestResult = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getTestResults(testId)
        setResults(data);
      } catch (error) {
        setError('Ошибка при загрузке результатов')
      }
    };
    fetchResults()
  }, [testId])

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/student/courses')}>
          Вернуться к курсам
        </Button>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">Загрузка результатов...</div>
      </Container>
    )
  }

  const handleRetakeTest = () => {
    navigate(`/student/tests/${testId}/start`);
  }

  const handleBackToCourse = () => {
    navigate('/student/courses');
  };

  return (
    <Container className="mt-4">
      <Card className='border-0'>
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <div className="fs-2 p-3" style={{ minWidth: '120px' }}>
              Оценка: {results.grade}
            </div>
            <p className="text-muted small">
              Завершено: {new Date(results.completedAt).toLocaleString()}
            </p>
          </div>

          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="border-0">
                <Card.Body>
                  <div className="p-3 rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                      <span className="fw-medium">Правильные ответы:</span>
                      <span className="fw-bold">
                        {results.correctAnswers} из {results.totalQuestions}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                      <span className="fw-medium">Неправильные ответы:</span>
                      <span className="fw-bold">
                        {results.totalQuestions - results.correctAnswers}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                      <span className="fw-medium">Процент правильных:</span>
                      <span className="fw-bold">
                        {results.percentage}%
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                      <span className="fw-medium">Набрано баллов:</span>
                      <span className="fw-bold">
                        {results.score}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                      <span className="fw-medium">Время выполнения:</span>
                      <span className="fw-bold">
                        {results.timeSpent} минут
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center  p-2 ">
                      <span className="fw-medium">Количесвто оставшився попыток:</span>
                      <span className="fw-bold">
                        {results.remainingAttempts} из {results.attemptsAllowed}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {!results.canRetake && (
            <strong><span className="mt-4  text-danger" >
              Невозможно пройти тест повторно:<span> </span>
              {results.remainingAttempts <= 0 && "не осталось попыток"}
              {results.deadline && new Date(results.deadline) < new Date() && "cрок сдачи теста истек"}
            </span></strong>
          )}
        </Card.Body>

        <Card.Footer className="bg-light py-3 ">
          <div className="d-flex justify-content-between">
            <Button variant="primary" onClick={handleBackToCourse} size="lg">
              Вернуться к курсам
            </Button>
            <Button variant="primary" onClick={handleRetakeTest} disabled={!results.canRetake} size="lg">
              Пройти тест еще раз
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  )
}

export default TestResult