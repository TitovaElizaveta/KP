import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Form, Alert, Row, Col, Table, Pagination } from 'react-bootstrap'
import { updateTest, getTestQuestions, removeQuestionsFromTest, addQuestionsToTest } from '../../../http/teacher/testAPI'
import { getMyQuestions } from '../../../http/teacher/questionAPI'

const EditTestModal = ({ show, onHide, test, onTestUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30
  })
  const [error, setError] = useState('')
  const [testQuestions, setTestQuestions] = useState([])
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('selected')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const difficultyLabels = {
    easy: { text: 'Легкий' },
    medium: { text: 'Средний' },
    hard: { text: 'Сложный' }
  }

  const typeLabels = {
    single: 'Один вариант',
    many: 'Несколько вариантов',
    write: 'Текстовый ответ',
    match: 'Соответствие'
  }

  const loadQuestions = useCallback(async () => {
    if (!test?.id) return

    try {
      const testQuestionsData = await getTestQuestions(test.id)
      setTestQuestions(testQuestionsData)

      const allQuestionsData = await getMyQuestions({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })
      const allQuestions = allQuestionsData.questions || []
      setTotalPages(allQuestionsData.totalPages || 1)

      const testQuestionIds = new Set(testQuestionsData.map(q => q.id))
      const filteredQuestions = allQuestions.filter(q => !testQuestionIds.has(q.id))

      setAvailableQuestions(filteredQuestions)
    } catch (e) {
      console.error('Error loading questions:', e)
      setError('Ошибка при загрузке вопросов')
    }
  }, [test?.id, currentPage, searchTerm])

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || '',
        description: test.description || '',
        timeLimit: test.timeLimit || 30
      })
      loadQuestions()
    }
  }, [test, loadQuestions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await updateTest(test.id, formData)
      onTestUpdated()
      onHide()
    } catch (e) {
      setError('Ошибка при обновлении теста')
      console.error('Error updating test:', e)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRemoveQuestion = async (questionId) => {
    try {
      await removeQuestionsFromTest(test.id, [questionId])
      await loadQuestions()
    } catch (e) {
      console.error('Error removing question:', e)
      setError('Ошибка при удалении вопроса')
    }
  }

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) return

    try {
      await addQuestionsToTest(test.id, selectedQuestions)
      setSelectedQuestions([])
      await loadQuestions()
      setActiveTab('selected')
    } catch (e) {
      console.error('Error adding questions:', e)
      setError('Ошибка при добавлении вопросов')
    }
  }

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактирование теста</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Название теста</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Время на выполнение (минут)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Описание теста</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Введите описание теста (необязательно)"
            />
          </Form.Group>

          <div className="mb-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Вопросы теста</h5>
              <div>{testQuestions.length} вопросов</div>
            </div>

            <div className="mb-3">
              <Button
                variant={activeTab === 'selected' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('selected')}
              >
                Выбранные вопросы
              </Button>
              <Button
                variant={activeTab === 'bank' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('bank')}
              >
                Банк вопросов
              </Button>
            </div>

            {activeTab === 'selected' ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {testQuestions.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    Нет выбранных вопросов. Перейдите во вкладку "Банк вопросов" чтобы добавить вопросы.
                  </div>
                ) : (
                  <Table className='mb-0' bordered size="sm">
                    <thead>
                      <tr>
                        <th>Текст вопроса</th>
                        <th>Тип</th>
                        <th>Сложность</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testQuestions.map((question) => (
                        <tr key={question.id}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {question.text}
                            </div>
                          </td>
                          <td>{typeLabels[question.type] || question.type}</td>
                          <td>
                            <div>
                              {difficultyLabels[question.difficulty]?.text || question.difficulty}
                            </div>
                          </td>
                          <td>
                            <Button variant="danger" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            ) : (
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Поиск</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Поиск вопроса"
                  />
                </Form.Group>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableQuestions.length === 0 ? (
                    <div className="text-center py-3 text-muted">
                      Вопросы не найдены
                    </div>
                  ) : (
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Текст вопроса</th>
                          <th>Тип</th>
                          <th>Сложность</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableQuestions.map((question) => {
                          const isSelected = selectedQuestions.includes(question.id);
                          return (
                            <tr key={question.id}>
                              <td><Form.Check type="checkbox" checked={isSelected} onChange={() => toggleQuestionSelection(question.id)} /></td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                  {question.text}
                                </div>
                              </td>
                              <td>{typeLabels[question.type] || question.type}</td>
                              <td>
                                <div>
                                  {difficultyLabels[question.difficulty]?.text || question.difficulty}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      />
                    </Pagination>
                  </div>
                )}

                <div className="mt-1">
                  <Button variant="success" onClick={handleAddQuestions} disabled={selectedQuestions.length === 0}>
                    Добавить выбранные вопросы ({selectedQuestions.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Сохранить изменения
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default EditTestModal