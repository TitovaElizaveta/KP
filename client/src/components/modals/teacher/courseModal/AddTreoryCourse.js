import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { uploadTheory } from '../../../../http/teacher/courseAPI'

const AddTheoryCourse = ({ show, onHide, courseId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [theoryTitle, setTheoryTitle] = useState('')
  const [error, setError] = useState('')

  const handleTheoryUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Выберите файл')
      return;
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', theoryTitle)

    try {
      await uploadTheory(courseId, formData)
      onHide()
      setSelectedFile(null)
      setTheoryTitle('')
      setError('')
      onSuccess()
    } catch (error) {
      setError('Ошибка при загрузке теории')
    }
  };

  return (
    <Modal  show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить теоретический материал</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleTheoryUpload}>
        <Modal.Body style={{ fontSize: '17px' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Название материала</Form.Label>
            <Form.Control
              type="text"
              value={theoryTitle}
              onChange={(e) => setTheoryTitle(e.target.value)}
              placeholder="Введите название материала"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>PDF файл</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Загрузить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AddTheoryCourse