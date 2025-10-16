import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert, Row, Col, Table, Pagination } from 'react-bootstrap'
import { getMyQuestions } from '../../../http/teacher/questionAPI'
import { createTest } from '../../../http/teacher/testAPI'

const CreateTestModal = ({ show, onHide, selectedQuestions: initialSelectedQuestions, onTestCreated, courseId }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('selected')
  const [bankQuestions, setBankQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState(initialSelectedQuestions || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getMyQuestions({
          page: currentPage,
          limit: 10,
          search: searchTerm
        })
        setBankQuestions(data.questions)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error)
        setError('Ошибка при загрузке вопросов');
      }
    }

    if (activeTab === 'bank' && show) {
      fetchQuestions()
    }
  }, [activeTab, show, currentPage, searchTerm])

  useEffect(() => {
    if (initialSelectedQuestions) {
      setSelectedQuestions(initialSelectedQuestions)
    }
  }, [initialSelectedQuestions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!title.trim()) {
        setError('Название теста обязательно')
        setIsSubmitting(false)
        return
      }
      if (selectedQuestions.length === 0) {
        setError('Выберите хотя бы один вопрос')
        setIsSubmitting(false)
        return
      }

      const testData = {
        title,
        description,
        timeLimit: parseInt(timeLimit),
        questionIds: selectedQuestions.map(q => q.id)
      }

      await createTest(testData)

      if (courseId) {
        setError('Тест создан. Не забудьте привязать его к курсу и установить дедлайн!')
        setTimeout(() => {
          resetForm()
          onHide()
          if (onTestCreated) onTestCreated()
        }, 3000)
      } else {
        resetForm()
        onHide()
        if (onTestCreated) onTestCreated()
      }
    } catch (error) {
      console.error('Ошибка при создании теста:', error)
      setError(error.response?.data?.message || 'Ошибка при создании теста')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTimeLimit(30)
    setSelectedQuestions([])
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleQuestionSelect = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id)
      if (isSelected) {
        return prev.filter(q => q.id !== question.id)
      } else {
        return [...prev, question]
      }
    })
  }

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId))
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

  return (
    <Modal show={show} onHide={onHide} size="lg" onExited={resetForm} centered>
      <Modal.Header closeButton>
        <Modal.Title>Создать тест</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ fontSize: '17px' }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group >
                <Form.Label>Название теста</Form.Label>
                <Form.Control style={{ cursor: 'pointer' }} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Введите название теста"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group >
                <Form.Label>Лимит времени (минут)</Form.Label>
                <Form.Control style={{ cursor: 'pointer' }} type="number" min="1" value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Описание теста</Form.Label>
            <Form.Control style={{ cursor: 'pointer' }} as="textarea" rows={2} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание теста (необязательно)"
            />
          </Form.Group>

          <div>
            <h5 className='mb-3'>Вопросы теста</h5>
            <div className=" mb-2">
              <Button variant={activeTab === 'selected' ? 'primary' : 'outline-primary'} className="me-2 " onClick={() => setActiveTab('selected')}>
                Выбранные вопросы
              </Button>
              <Button variant={activeTab === 'bank' ? 'primary' : 'outline-primary'} onClick={() => setActiveTab('bank')}>
                Банк вопросов
              </Button>
            </div>

            {activeTab === 'selected' ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedQuestions.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    Нет выбранных вопросов. Перейдите во вкладку "Банк вопросов" чтобы добавить вопросы.
                  </div>
                ) : (
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Текст вопроса</th>
                        <th>Тип</th>
                        <th>Сложность</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuestions.map((question) => (
                        <tr key={question.id}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {question.text}
                            </div>
                          </td>
                          <td>{typeLabels[question.type]}</td>
                          <td><span>{difficultyLabels[question.difficulty].text}</span>
                          </td>
                          <td>
                            <Button className='' variant="danger" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
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
                  <Form.Control style={{ cursor: 'pointer' }} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Поиск вопроса" />
                </Form.Group>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {bankQuestions.length === 0 ? (
                    <div className="text-center py-3 text-muted">
                      Вопросы не найдены
                    </div>
                  ) : (
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th> </th>
                          <th>Текст вопроса</th>
                          <th>Тип</th>
                          <th>Сложность</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankQuestions.map((question) => {
                          const isSelected = selectedQuestions.some(q => q.id === question.id);
                          return (
                            <tr key={question.id}>
                              <td>
                                <Form.Check type="checkbox" checked={isSelected} onChange={() => handleQuestionSelect(question)} />
                              </td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                  {question.text}
                                </div>
                              </td>
                              <td>{typeLabels[question.type]}</td>
                              <td><div>{difficultyLabels[question.difficulty].text}</div>
                              </td>
                            </tr>
                          );
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
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать тест'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateTestModal