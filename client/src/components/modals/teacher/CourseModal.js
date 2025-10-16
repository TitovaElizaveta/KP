import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { createCourse, updateCourse, getAllGroups } from '../../../http/teacher/courseAPI'

const CourseModal = ({ show, onHide, course, onCourseUpdated }) => {
  const [title, setTitle] = useState('')
  const [groupIds, setGroupIds] = useState([])
  const [groups, setGroups] = useState([])

  useEffect(() => {
    if (show) {
      fetchGroups()
      if (course) {
        setTitle(course.title || '')
        setGroupIds(course.groups ? course.groups.map(g => g.id) : [])
      } else {
        setTitle('')
        setGroupIds([])
      }
    }
  }, [show, course])

  const fetchGroups = async () => {
    const data = await getAllGroups();
    setGroups(data)
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (course) {
        await updateCourse(course.id, { title, groupIds })
      } else {
        await createCourse({ title, groupIds })
      }
      onHide();
      onCourseUpdated();
    } catch (error) {
      alert(`Ошибка при ${course ? 'обновлении' : 'создании'} курса`);
    }
  };

  const handleGroupChange = (e) => {
    const options = e.target.options;
    const selectedValues = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(Number(options[i].value))
      }
    }
    setGroupIds(selectedValues)
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {course ? 'Редактировать курс' : 'Создать новый курс'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ fontSize: '17px' }}>
          <Form.Group className="mb-3">
            <Form.Label>Название курса</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Введите название курса"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Группы</Form.Label>
            <Form.Select
              multiple
              value={groupIds}
              onChange={handleGroupChange}
              size={5}
            >
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Удерживайте Ctrl для выбора нескольких групп
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            {course ? 'Сохранить' : 'Создать'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CourseModal