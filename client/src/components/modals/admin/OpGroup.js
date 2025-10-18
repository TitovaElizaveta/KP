import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const GroupModal = ({ show, onHide, onSubmit, initialValues, submitting }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
    } else {
      setName('');
    }
    setError('');
  }, [initialValues, show]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Введите название группы');
      return;
    }
    
    setError('');
    onSubmit({ name });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {initialValues ? 'Редактирование группы' : 'Создание группы'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Название группы</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите название группы"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GroupModal