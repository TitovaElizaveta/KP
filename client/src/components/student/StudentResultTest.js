import React, { useState, useEffect } from 'react'
import { Container, Card, Table, Button,  Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getAttemptHistory } from '../../http/student/testAPI'

const StudentResultTest = () => {
  const [attempts, setAttempts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await getAttemptHistory()
        console.log('Received data:', data)
        setAttempts(data)
      } catch (error) {
        setError('Ошибка при загрузке результатов тестов')
        console.error('Error fetching attempts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()
  }, [])
  
  const canViewAnswers = (attempt) => {
    const now = new Date()
    const deadline = attempt.deadline ? new Date(attempt.deadline) : null

    return !deadline || now > deadline || attempt.remainingAttempts === 0
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">Загрузка результатов...</div>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-light py-3">
          <h4 className="mb-0">Мои результаты тестов</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {attempts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h5>Нет завершенных тестов</h5>
              <p>Здесь появятся результаты пройденных тестов</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-light">
                  <tr>
                    <th>Тест</th>
                    <th>Курс</th>
                    <th>Оценка</th>
                    <th>Баллы</th>
                    <th>Дата завершения</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>
                        {attempt.test?.title || 'Неизвестный тест'}
                        {attempt.test?.description && (
                          <div className="text-muted small mt-1">
                            {attempt.test.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {attempt.courseName}
                      </td>
                      <td>
                        <div>{attempt.grade}</div>
                      </td>
                      <td>
                        <div>
                          {attempt.score}
                        </div>
                      </td>
                      <td>
                        {new Date(attempt.updatedAt).toLocaleString('ru-RU')}
                      </td>
                      <td>
                        <span>
                          {attempt.isCompleted ? 'Завершен' : 'В процессе'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <Button
                            as={Link}
                            to={`/student/tests/review/${attempt.id}`}
                            variant="primary"
                            disabled={!canViewAnswers(attempt)}
                            title={
                              canViewAnswers(attempt)
                                ? 'Посмотреть ответы'
                                : 'Ответы будут доступны после дедлайна'
                            }
                          >
                            Ответы
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default StudentResultTest