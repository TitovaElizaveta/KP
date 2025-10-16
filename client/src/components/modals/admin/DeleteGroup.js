// DeleteGroupModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap'
import { deleteGroup } from '../../../http/admin/groupAPI'

const DeleteGroup = ({ show, onHide, onConfirm, group }) => {
  const handleDelete = async () => {
    try {
      await deleteGroup(group.id)
      onConfirm()
    } catch (error) {
      alert('Ошибка при удалении группы')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить группу</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить <strong>"{group?.name}"</strong>?</p>
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

export default DeleteGroup