import React, { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

const OpTeacher = ({ show, onHide, onSubmit, initialValues, submitting, title }) => {
  const [formData, setFormData] = useState({
    email: '',
    surname: '',
    name: '',
    last_name: '',
    password: ''
  });
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (initialValues) {
      setFormData({
        email: initialValues.email || '',
        surname: initialValues.surname || '',
        name: initialValues.name || '',
        last_name: initialValues.last_name || '',
        password: ''
      });
    } else {
      setFormData({
        email: '',
        surname: '',
        name: '',
        last_name: '',
        password: ''
      });
    }
    setErrors({});
    setTouched({});
  }, [initialValues, show]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ position: 'relative' }}>
          {submitting && (
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)',
               display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,}}></div>
          )}
          <Form onSubmit={handleSubmit}>
            <div className="row mb-2 ">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Фамилия</Form.Label>
                  <Form.Control type="text" placeholder="Иванов"
                    value={formData.surname}
                    onChange={(e) => handleChange('surname', e.target.value)}
                    onBlur={() => handleBlur('surname')}
                    isInvalid={touched.surname && !!errors.surname}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.surname}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Имя</Form.Label>
                  <Form.Control type="text" placeholder="Иван"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    isInvalid={touched.name && !!errors.name}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Отчество</Form.Label>
                  <Form.Control type="text" placeholder="Иванович (необязательно)"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    disabled={submitting}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="uuu@pochta.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                isInvalid={touched.email && !!errors.email}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {!initialValues && (
              <Form.Group className="mb-3">
                <Form.Label>Пароль</Form.Label>
                <Form.Control type="password" placeholder="Не менее 6 символов"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  isInvalid={touched.password && !!errors.password}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            )}
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {initialValues ? 'Обновить данные' : 'Добавить преподавателя'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default OpTeacher