import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { deleteTheory } from '../../../../http/teacher/courseAPI'

const DeleteTreory = ({ show, onHide, theory, onTheoryDeleted }) => {
  const handleDelete = async () => {
    try {
      await deleteTheory(theory.id)
      onTheoryDeleted()
      onHide()
    } catch (error) {
      alert('Ошибка при удалении материала')
    }
  }

  return (
    <Modal style={{ fontSize: '17px' }} show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить материал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{theory?.title}"</strong>?</p>
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

export default DeleteTreory