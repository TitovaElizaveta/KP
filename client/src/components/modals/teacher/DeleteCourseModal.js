import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { deleteCourse } from '../../../http/teacher/courseAPI'

const DeleteCourseModal = ({ show, onHide, course, onCourseDeleted }) => {
  const handleDelete = async () => {
    try {
      await deleteCourse(course.id)
      onCourseDeleted()
      onHide()
    } catch (error) {
      alert('Ошибка при удалении курса')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить курс</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{course?.title}"</strong>?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteCourseModal