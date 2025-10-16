import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Dropdown, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import CourseModal from '../modals/teacher/CourseModal'
import DeleteCourseModal from '../modals/teacher/DeleteCourseModal'
import { getMyCourses } from '../../http/teacher/courseAPI'
import '../../style/Dropdown.css'

const TeacherCourses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses()
      setCourses(data)
    } catch (error) {
      setError('Ошибка при загрузке курсов')
    }
  }

  const handleCreate = () => {
    setSelectedCourse(null)
    setShowModal(true)
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleDeleteClick = (course) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    fetchCourses()
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Мои курсы</h1>
            <Button variant="primary" onClick={handleCreate}>
              Создать новый курс
            </Button>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row>
        {courses.map(course => (
          <Col md={6} lg={4} key={course.id} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="mb-0">{course.title}</Card.Title>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="no-arrow">
                      ︙
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEdit(course)}>
                        Редактировать
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => handleDeleteClick(course)}
                      >
                        Удалить
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="mb-3">
                  <h6>Группы:</h6>
                  {course.groups && course.groups.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      {course.groups.map(group => (
                        <div key={group.id} className="me-1 mb-1">
                          {group.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Группы не назначены</span>
                  )}
                </div>

                <div className="mt-auto">
                  <Button onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                    Перейти к курсу
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <CourseModal
        show={showModal}
        onHide={() => setShowModal(false)}
        course={selectedCourse}
        onCourseUpdated={fetchCourses}
      />

      <DeleteCourseModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        course={selectedCourse}
        onCourseDeleted={handleDeleteConfirm}
      />
    </Container>
  )
}

export default TeacherCourses