import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { deleteTeacher } from '../../../http/admin/teacherAPI'

const DeleteTeacher = ({ show, onHide, onConfirm, teacher }) => {
  const getTeacherFullName = () => {
    if (!teacher) return ''
    return `${teacher.surname} ${teacher.name} ${teacher.last_name || ''}`.trim()
  }

  const handleDelete = async () => {
    try {
      await deleteTeacher(teacher.id)
      onConfirm();
    } catch (error) {
      alert('Ошибка при удалении преподавателя')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить преподавателя</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{getTeacherFullName()}"</strong>?</p>
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
export default DeleteTeacher