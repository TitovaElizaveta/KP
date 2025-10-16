import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseDetails, getCourseTheory, getCourseTests, downloadTheory } from '../http/student/coursesAPI'
import TestPreviewModal from '../components/modals/student/TestPreviewModal'

const CourseStudentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [theories, setTheories] = useState([])
  const [tests, setTests] = useState([])
  const [error, setError] = useState('')
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await getCourseDetails(id)
        setCourse(courseData);

        const theoriesData = await getCourseTheory(id)
        setTheories(theoriesData);

        const testsData = await getCourseTests(id)
        setTests(testsData);
      } catch (error) {
        setError('Ошибка при загрузке данных курса')
      }
    }

    fetchCourseData()
  }, [id])

  const handleViewTheory = (theoryId) => {
    navigate(`/student/courses/${id}/theory/${theoryId}/view`)
  }

  const handleDownloadTheory = async (theoryId) => {
    try {
      const response = await downloadTheory(theoryId)
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url;
      link.download = `theory_${theoryId}.pdf`
      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Ошибка при скачивании теории')
    }
  }

  const handleTestPreview = (test) => {
    setSelectedTest(test)
    setShowTestModal(true)
  }

  const handleConfirmTest = () => {
    if (selectedTest) {
      setShowTestModal(false);
      navigate(`/student/tests/${selectedTest.id}/start`)
    }
  }

  const handleCloseModal = () => {
    setShowTestModal(false)
    setSelectedTest(null)
  }

  const handleViewResults = (testId) => {
    navigate(`/student/tests/${testId}/results`)
  };

  if (!course) {
    return (
      <Container>
        <div className="text-center py-5">Загрузка...</div>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>{course.title}</h1>
          {course.description && <p className="text-muted">{course.description}</p>}
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Теоретический материал</h4>
            </Card.Header>
            <Card.Body>
              {theories.length === 0 ? (
                <div className="text-center py-3 text-muted">Нет учебных материалов</div>
              ) : (
                <div className="row">
                  {theories.map(theory => (
                    <div key={theory.id} className="col-md-6 col-lg-3 mb-3">
                      <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-4">
                            <Card.Title className="h4 mb-0">{theory.title}</Card.Title>
                            <Button variant="outline-secondary"
                              size="sm"
                              onClick={() => handleDownloadTheory(theory.id)}
                              title="Скачать"
                              style={{ fontSize: '18px', color: 'black', fontWeight: 'bolder', border: 'none', backgroundColor: 'white' ,width: '35px' }}
                            >
                              🠗
                            </Button>
                          </div>
                          <Button variant="primary" onClick={() => handleViewTheory(theory.id)}>
                            Изучить теорию
                          </Button>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Тесты</h4>
            </Card.Header>
            <Card.Body>
              {tests.length === 0 ? (
                <div className="text-center py-3 text-muted">Нет доступных тестов</div>
              ) : (
                <div className="row">
                  {tests.map(test => (
                    <div key={test.id} className="col-md-6 col-lg-3 mb-3">
                      <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h5">{test.title}</Card.Title>
                          {test.description && <Card.Text className="text-muted small">{test.description}</Card.Text>}
                          <div className="mb-3">
                            <div><strong>Время:</strong> {test.timeLimit} мин</div>
                            <div><strong>Попыток:</strong> {test.attemptsAllowed}</div>
                            {test.deadline && (
                              <div>
                                <strong>Дедлайн:</strong> {new Date(test.deadline).toLocaleDateString()}
                                {new Date() > new Date(test.deadline) && (
                                  <span className="p-2 text-danger fw-bold">Просрочен</span>
                                )}
                              </div>
                            )}
                            {test.studentAttempts && (
                              <div><strong>Ваши попытки:</strong> {test.studentAttempts.length}</div>
                            )}
                          </div>
                          <div className="mt-auto d-grid gap-2">
                            <Button
                              variant="primary"
                              onClick={() => handleTestPreview(test)}
                              disabled={test.studentAttempts && test.studentAttempts.length >= test.attemptsAllowed}
                            >
                              Пройти тест
                            </Button>
                            {test.studentAttempts && test.studentAttempts.length > 0 && (
                              <Button
                                variant="outline-secondary"
                                onClick={() => handleViewResults(test.id)}
                              >
                                Посмотреть результаты
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <TestPreviewModal
        show={showTestModal}
        onHide={handleCloseModal}
        test={selectedTest}
        onConfirm={handleConfirmTest}
      />
    </Container>
  )
}

export default CourseStudentPage;