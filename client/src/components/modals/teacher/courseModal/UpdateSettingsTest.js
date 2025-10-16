import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { updateCourseTest } from '../../../../http/teacher/courseAPI'

const UpdateSettingsTest = ({ show, onHide, courseId, test, onTestUpdated }) => {
  const [deadline, setDeadline] = useState('')
  const [attemptsAllowed, setAttemptsAllowed] = useState(1)

  useEffect(() => {
    if (test) {
      const formattedDeadline = test.deadline ? new Date(test.deadline).toISOString().split('T')[0] : ''
      setDeadline(formattedDeadline)
      setAttemptsAllowed(test.attemptsAllowed || 1)
    }
  }, [test])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await updateCourseTest(courseId, test.id, {
        deadline: deadline ? new Date(deadline) : null,
        attemptsAllowed: parseInt(attemptsAllowed)
      })

      onTestUpdated()
      onHide()
    } catch (error) {
      alert('Ошибка при обновлении теста')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать параметры теста</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ fontSize: '17px' }}>
          <Form.Group className="mb-3">
            <Form.Label>Название теста</Form.Label>
            <Form.Control
              type="text"
              value={test?.title || ''}
              disabled
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Дедлайн</Form.Label>
            <Form.Control
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Form.Text className="text-muted">
              Оставьте пустым, если дедлайн не установлен
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Количество попыток</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={attemptsAllowed}
              onChange={(e) => setAttemptsAllowed(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Сохранить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UpdateSettingsTest