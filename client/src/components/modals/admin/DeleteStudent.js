import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { deleteStudent } from '../../../http/admin/studentAPI'

const DeleteStudent = ({ show, onHide, onConfirm, student }) => {
  const getStudentFullName = () => {
    if (!student) return ''
    return `${student.surname} ${student.name} ${student.last_name || ''}`.trim()
  }

  const handleDelete = async () => {
    try {
      await deleteStudent(student.id)
      onConfirm();
    } catch (error) {
      alert('Ошибка при удалении студента')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить студента</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{getStudentFullName()}"</strong>?</p>
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
export default DeleteStudent