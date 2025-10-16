import React, { useState, useEffect } from 'react'
import { Container, Card, Alert, ListGroup, Badge, Button } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { getAttemptDetails } from '../../http/student/testAPI'

const StudentTestReview = () => {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        const data = await getAttemptDetails(attemptId)
        setAttempt(data)
      } catch (error) {
        setError('Ошибка при загрузке деталей попытки')
        console.error('Error fetching attempt details:', error)
      } finally {
        setLoading(false)
      }
    };

    if (attemptId) {
      fetchAttemptDetails()
    } else {
      setError('ID попытки не указан')
      setLoading(false)
    }
  }, [attemptId])

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">Загрузка теста...</div>
      </Container>
    );
  }

  if (error || !attempt) {
    return (
      <Container>
        <Alert variant="danger">
          {error || 'Попытка не найдена'}
        </Alert>
        <Button variant="outline-secondary" onClick={() => navigate('/student/tests')}>
          Назад к результатам
        </Button>
      </Container>
    )
  }

  return (
    <Container>
      <div style={{ marginLeft: '25px' }}>
        <h1 className="mb-3 ">Просмотр теста</h1>
        <h3 className="mb-3">{attempt.test?.title || 'Тест'}. Оценка: {attempt.grade}</h3>
      </div>

      <Card className='border-0'>
        <Card.Body>
          {attempt.questions && attempt.questions.length > 0 ? (
            attempt.questions.map((question, index) => {
              const studentAnswer = attempt.studentAnswers?.find(
                sa => sa.id_question === question.id
              )

              return (
                <Card key={question.id} className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Вопрос {index + 1}</strong>
                    </div>

                  </Card.Header>
                  <Card.Body>
                    <p className="mb-3 fw-bold">{question.text}</p>

                    {(question.type === 'single' || question.type === 'many') && (
                      <div className="mb-4">
                        <h6 className="mb-3">Варианты ответов:</h6>
                        {renderAnswerOptions(question, studentAnswer)}
                      </div>
                    )}

                    {question.type === 'write' && (
                      <div className="mb-4">
                        <h6 className="mb-2">Ответ студента:</h6>
                        <div className="p-3 bg-light rounded">
                          {renderStudentAnswer(question, studentAnswer)}
                        </div>
                      </div>
                    )}

                    {question.type === 'match' && (
                      <div className="mb-4">
                        {renderMatchQuestion(question, studentAnswer)}
                      </div>
                    )}

                    <div className="p-3 bg-success bg-opacity-10 rounded">
                      <h6 className="text-success mb-2">Правильный ответ:</h6>
                      {renderCorrectAnswer(question)}
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted">
              В тесте нет вопросов
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

const renderAnswerOptions = (question, studentAnswer) => {
  const selectedOptions = getSelectedOptions(question, studentAnswer);

  return (
    <ListGroup variant="flush">
      {question.answerOptions?.map((option) => {
        const isSelected = selectedOptions.some(opt => opt.id === option.id);
        const isCorrect = option.isCorrect;

        return (
          <ListGroup.Item
            key={option.id}
            className={`d-flex align-items-center ${isSelected
              ? (isCorrect ? 'bg-success bg-opacity-10 rounded' : 'bg-danger bg-opacity-10 rounded')
              : ''
              } `}
          >
            <div className="me-2">
              {question.type === 'single' ? (
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                />
              ) : (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                />
              )}
            </div>
            <div className="flex-grow-1">
              {option.text}
            </div>
            {isSelected && !isCorrect && (
              <Badge bg="danger" className="ms-2">Ваш выбор</Badge>
            )}
            {isSelected && isCorrect && (
              <Badge bg="success" className="ms-2">Ваш выбор</Badge>
            )}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  )
}

const renderStudentAnswer = (question, studentAnswer) => {
  if (!studentAnswer) {
    return <span className="text-muted">Ответа нет</span>
  }

  let answerText = studentAnswer.answerText

  if (answerText) {
    if (answerText.startsWith('"') && answerText.endsWith('"')) {
      answerText = answerText.slice(1, -1)
    }
    answerText = answerText.replace(/\\n/g, ' ').trim()
  }
  return <span>{answerText}</span>
}

const renderMatchQuestion = (question, studentAnswer) => {
  if (!question.matchPairs || question.matchPairs.length === 0) {
    return <div className="text-muted">Пары соответствия не указаны</div>
  }

  const matchPair = question.matchPairs[0];
  const leftItems = matchPair.leftItems?.split(',').map(item => item.trim()) || [];
  const rightItems = matchPair.rightItems?.split(',').map(item => item.trim()) || [];

  return (
    <div>
      <h6 className="mb-3">Пары для соответствия:</h6>
      <div className="row mb-4">
        <div className="col-md-6">
          <strong>Левый столбец:</strong>
          <div className="mt-2">
            {leftItems.map((item, idx) => (
              <div key={idx} className="mb-1">
                {idx + 1}. {item}
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <strong>Правый столбец:</strong>
          <div className="mt-2">
            {rightItems.map((item, idx) => (
              <div key={idx} className="mb-1">
                {String.fromCharCode(65 + idx)}. {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h6 className="mb-2">Ответ студента:</h6>
      <div className="p-3 bg-light rounded">
        {studentAnswer?.answerText || 'Ответа нет'}
      </div>
    </div>
  )
}

const getSelectedOptions = (question, studentAnswer) => {
  if (!studentAnswer?.answerText) return []

  let selectedIds = []

  try {
    if (studentAnswer.answerText.startsWith('[')) {
      selectedIds = JSON.parse(studentAnswer.answerText);
    } else if (studentAnswer.answerText.includes(',')) {
      selectedIds = studentAnswer.answerText.split(',').map(id => id.trim().replace(/"/g, ''))
    } else {
      selectedIds = [studentAnswer.answerText.replace(/"/g, '')];
    }
  } catch (e) {
    selectedIds = [studentAnswer.answerText.replace(/"/g, '')];
  }

  selectedIds = selectedIds.map(id => id.toString());

  return question.answerOptions?.filter(opt =>
    selectedIds.includes(opt.id.toString())
  ) || []
}

const renderCorrectAnswer = (question) => {
  switch (question.type) {
    case 'single':
      const correctOption = question.answerOptions?.find(opt => opt.isCorrect);
      return correctOption ? (
        <div>{correctOption.text}</div>
      ) : (
        <div className="text-muted">Правильный ответ не указан</div>
      );

    case 'many':
      const correctOptions = question.answerOptions?.filter(opt => opt.isCorrect);
      return correctOptions && correctOptions.length > 0 ? (
        <div>
          {correctOptions.map(opt => (
            <div key={opt.id}>{opt.text}</div>
          ))}
        </div>
      ) : (
        <div className="text-muted">Правильные ответы не указаны</div>
      );

    case 'write':
      return (
        <div>{question.correctWrite?.correctText || 'Правильный ответ не указан'}</div>
      )

    case 'match':
      if (!question.matchPairs || question.matchPairs.length === 0) {
        return <div className="text-muted">Пары соответствия не указаны</div>
      }

      const matchPair = question.matchPairs[0]
      const leftItems = matchPair.leftItems?.split(',').map(item => item.trim()) || []

      const correctPairs = leftItems.map((_, index) => {
        const number = index + 1
        const letter = String.fromCharCode(65 + index)
        return `${number}-${letter}`
      }).join(', ')
      return correctPairs

    default:
      return <div className="text-muted">Правильный ответ не указан</div>
  }
}

export default StudentTestReview