import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { detachTestFromCourse } from '../../../../http/teacher/courseAPI'

const DeleteTest = ({ show, onHide, test, courseId, onTestDeleted }) => {
  const handleDelete = async () => {
    try {
      await detachTestFromCourse(courseId, test.id)
      onTestDeleted()
      onHide()
    } catch (error) {
      alert('Ошибка при удалении теста с курса')
    }
  }

  return (
    <Modal style={{ fontSize: '17px' }} show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить тест с курса</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{test?.title}"</strong> с курса?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Удалить с курса
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteTest