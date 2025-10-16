import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Container, Row, Col, Card, Button, Form, Table, Pagination, Alert } from 'react-bootstrap'
import { observer } from 'mobx-react-lite'
import { Context } from '../../index'
import { getMyQuestions, searchQuestions } from '../../http/teacher/questionAPI'
import QuestionModal from '../modals/teacher/QuestionModal'
import CreateTestModal from '../modals/teacher/CreateTestModal'
import DeleteQuestionModal from '../modals/teacher/DeleteQuestionModal'

const QuestionBank = observer(() => {
  const { user, question } = useContext(Context)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    search: '',
    my: true
  })
  const [showModal, setShowModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [error, setError] = useState('')

  const fetchQuestions = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit,
        ...filters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const data = filters.my
        ? await getMyQuestions(params)
        : await searchQuestions(params);

      question.setQuestions(data.questions);
      setTotalCount(data.totalCount);
    } catch (error) {
      setError('Ошибка при загрузке вопросов');
      console.error('Ошибка при загрузке вопросов:', error)
    }
  }, [currentPage, limit, filters, question])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!questionToDelete?.id) return

    try {
      await fetchQuestions(); // Просто перезагружаем вопросы
      setShowDeleteModal(false)
      setQuestionToDelete(null)
    } catch (error) {
      setError('Ошибка при удалении вопроса')
      console.error('Ошибка при удалении вопроса:', error)
    }
  };

  const handleEdit = (question) => {
    setModalMode('edit')
    setSelectedQuestion(question)
    setShowModal(true)
  }

  const handleCreate = () => {
    setModalMode('create')
    setSelectedQuestion(null)
    setShowModal(true)
  }

  const handleQuestionSelect = (q) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(item => item.id === q.id)
      if (isSelected) {
        return prev.filter(item => item.id !== q.id)
      } else {
        return [...prev, q]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedQuestions.length === question.questions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions([...question.questions])
    }
  }

  const difficultyLabels = {
    easy: { text: 'Легкий', variant: 'success' },
    medium: { text: 'Средний', variant: 'warning' },
    hard: { text: 'Сложный', variant: 'danger' }
  }

  const typeLabels = {
    single: 'Один вариант',
    many: 'Несколько вариантов',
    write: 'Текстовый ответ',
    match: 'Соответствие'
  }

  const totalPages = Math.ceil(totalCount / limit)

  const canEditQuestion = (q) => {
    return user.user.id && q.createdBy.toString() === user.user.id.toString()
  }

  return (
    <Container >
      <Row className="mb-4">
        <Col>
          <h1>Банк вопросов</h1>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Тип вопроса</Form.Label>
                <Form.Select style={{ cursor: 'pointer' }}
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Все типы</option>
                  <option value="single">Один вариант</option>
                  <option value="many">Несколько вариантов</option>
                  <option value="write">Текстовый ответ</option>
                  <option value="match">Соответствие</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Сложность</Form.Label>
                <Form.Select style={{ cursor: 'pointer' }}
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="">Все уровни</option>
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Поиск</Form.Label>
                <Form.Control type="text" placeholder="Поиск по тексту вопроса..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Только мои"
                  checked={filters.my}
                  onChange={(e) => handleFilterChange('my', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between">
            <div>
              <Button variant="primary" onClick={handleCreate} className="me-2">
                Создать вопрос
              </Button>
              <Button
                variant="success"
                onClick={() => setShowTestModal(true)}
                disabled={selectedQuestions.length === 0}
              >
                Создать тест ({selectedQuestions.length})
              </Button>
            </div>
            <Button variant="outline-secondary" onClick={fetchQuestions}>
              Обновить
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {question.questions.length === 0 ? (
            <div className="text-center py-4">Вопросы не найдены</div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedQuestions.length === question.questions.length && question.questions.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Текст вопроса</th>
                    <th>Тип</th>
                    <th>Сложность</th>
                    <th>Баллы</th>
                    <th>Автор</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {question.questions.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedQuestions.some(item => item.id === q.id)}
                          onChange={() => handleQuestionSelect(q)}
                        />
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }} title={q.text}>
                          {q.text}
                        </div>
                      </td>
                      <td>{typeLabels[q.type]}</td>
                      <td>{difficultyLabels[q.difficulty].text}</td>
                      <td>{q.points}</td>
                      <td>{q.creater ? `${q.creater.surname} ${q.creater.name}` : 'Неизвестно'}</td>
                      <td>
                        {canEditQuestion(q) ? (
                          <>
                            <Button variant="primary" size="sm" className="me-1" onClick={() => handleEdit(q)}>
                              Редактировать
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(q)}>
                              Удалить
                            </Button>
                          </>
                        ) : (
                          <span className="text-muted">Только просмотр</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <Pagination className="justify-content-center">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />

                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <QuestionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={modalMode}
        question={selectedQuestion}
        onQuestionUpdated={fetchQuestions}
      />

      <CreateTestModal
        show={showTestModal}
        onHide={() => setShowTestModal(false)}
        selectedQuestions={selectedQuestions}
        onTestCreated={() => {
          setShowTestModal(false);
          setSelectedQuestions([]);
        }}
      />

      <DeleteQuestionModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        question={questionToDelete}
        onQuestionDeleted={handleDeleteConfirm}
      />
    </Container>
  )
})

export default QuestionBank