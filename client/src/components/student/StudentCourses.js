import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { getMyCourses } from '../../http/student/coursesAPI'

const StudentCourse = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
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

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои дисциплины</h1>
      </div>
      <Row>
        {courses.map(course => (
          <Col lg={3} key={course.id} className="mb-4">
            <Card style={{ minHeight: '130px' }}>
              <Card.Body className="d-flex flex-column">
                <Card.Title>{course.title}</Card.Title>
                <div className="mt-auto">
                  <Button onClick={() => navigate(`/student/courses/${course.id}`)} className="w-100 mt-3">
                    Перейти к дисциплине
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {courses.length === 0 && !error && (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">Дисциплины не найдены</h5>
            <p className="text-muted mb-3">
              Вы еще не записаны ни на один курс. Обратитесь к преподавателю.
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}

export default StudentCourse