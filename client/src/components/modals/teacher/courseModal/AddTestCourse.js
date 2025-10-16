import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { attachTestToCourse } from '../../../../http/teacher/courseAPI'

const AddTestCourse = ({ show, onHide, courseId, myTests, onSuccess }) => {
  const [error, setError] = useState('')

  const handleTestAttach = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const testId = formData.get('testId')
    const deadline = formData.get('deadline')
    const attemptsAllowed = formData.get('attemptsAllowed')

    try {
      await attachTestToCourse(courseId, testId, {
        deadline,
        attemptsAllowed: parseInt(attemptsAllowed)
      })
      onHide()
      setError('')
      onSuccess()
    } catch (error) {
      setError('Ошибка при добавлении теста к курсу')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить тест к курсу</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleTestAttach}>
        <Modal.Body style={{ fontSize: '17px' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Выберите тест</Form.Label>
            <Form.Select name="testId" required>
              <option value="">Выберите тест</option>
              {myTests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.title} ({test.questions?.length || 0} вопросов)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Дедлайн</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Количество попыток</Form.Label>
            <Form.Control
              type="number"
              name="attemptsAllowed"
              min="1"
              defaultValue="1"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Добавить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AddTestCourse