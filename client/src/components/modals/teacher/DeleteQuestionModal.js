import React from 'react'
import { Modal, Button, Alert } from 'react-bootstrap'
import { deleteQuestion } from '../../../http/teacher/questionAPI'

const DeleteQuestionModal = ({ show, onHide, question, onQuestionDeleted }) => {
  const [error, setError] = React.useState('')

  const handleDelete = async () => {
    if (!question?.id) {
      setError('Ошибка: вопрос не выбран')
      return
    }

    try {
      await deleteQuestion(question.id)
      onQuestionDeleted()
      onHide()
    } catch (e) {
      setError('Ошибка при удалении вопроса')
      console.error('Delete question error:', e)
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить вопрос</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Вы уверены, что хотите удалить вопрос?</p>
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

export default DeleteQuestionModal