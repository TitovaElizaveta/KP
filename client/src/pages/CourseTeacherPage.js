import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Button, Alert, Dropdown } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseById, getCourseTheory, getCourseTests } from '../http/teacher/courseAPI'
import { getMyTests } from '../http/teacher/testAPI'
import AddTreoryCourse from '../components/modals/teacher/courseModal/AddTreoryCourse'
import AddTestCourse from '../components/modals/teacher/courseModal/AddTestCourse'
import DeleteTest from '../components/modals/teacher/courseModal/DeleteTest'
import DeleteTheory from '../components/modals/teacher/courseModal/DeleteTheory'
import UpdateSettingsTest from '../components/modals/teacher/courseModal/UpdateSettingsTest'
import '../style/Dropdown.css' 

const CoursePage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [theories, setTheories] = useState([])
  const [tests, setTests] = useState([])
  const [myTests, setMyTests] = useState([])
  const [error, setError] = useState('')
  const [showTheoryModal, setShowTheoryModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showDeleteTheoryModal, setShowDeleteTheoryModal] = useState(false)
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false)
  const [showEditTestModal, setShowEditTestModal] = useState(false)
  const [selectedTheory, setSelectedTheory] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)

  const fetchCourseData = useCallback(async () => {
    try {
      const courseData = await getCourseById(courseId)
      setCourse(courseData)
      
      const theoriesData = await getCourseTheory(courseId)
      setTheories(theoriesData)
      
      const testsData = await getCourseTests(courseId)
      setTests(testsData)
    } catch (error) {
      setError('Ошибка при загрузке данных курса')
    }
  }, [courseId])

  const fetchMyTests = useCallback(async () => {
    try {
      const data = await getMyTests()
      setMyTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    }
  }, [])

  useEffect(() => {
    fetchCourseData()
    fetchMyTests()
  }, [fetchCourseData, fetchMyTests])

  const handleTheoryDeleteClick = (theory) => {
    setSelectedTheory(theory)
    setShowDeleteTheoryModal(true)
  }

  const handleTestDeleteClick = (test) => {
    setSelectedTest(test)
    setShowDeleteTestModal(true)
  }

  const handleTestEditClick = (test) => {
    setSelectedTest(test)
    setShowEditTestModal(true)
  }

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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>{course.title}</h1>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setShowTheoryModal(true)}>
                Добавить теорию
              </Button>
              <Button variant="success" onClick={() => setShowTestModal(true)}>
                Добавить тест
              </Button>
            </div>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Теоретические материалы</h4>
            </Card.Header>
            <Card.Body>
              {theories.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  Нет загруженных материалов
                </div>
              ) : (
                <div className="row">
                  {theories.map(theory => (
                    <div key={theory.id} className="col-md-6 col-lg-4 mb-3">
                      <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start">
                            <Card.Title className="h5 mb-3 flex-grow-1">{theory.title}</Card.Title>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm" className="no-arrow">
                                ︙
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => window.open(`http://localhost:5000/uploads/${theory.filePath}`, '_blank')}>
                                  Просмотреть
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTheoryDeleteClick(theory)} className="text-danger">
                                  Удалить
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Тесты курса</h4>
            </Card.Header>
            <Card.Body>
              {tests.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  Нет добавленных тестов
                </div>
              ) : (
                <div className="row">
                  {tests.map(courseTest => (
                    <div key={courseTest.Test.id} className="col-md-6 col-lg-4 mb-3">
                      <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start">
                            <Card.Title className="h5 flex-grow-1">{courseTest.Test.title}</Card.Title>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm" className="no-arrow">
                                ︙
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate(`/teacher/tests/${courseTest.Test.id}`)}>
                                  Просмотреть тест
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTestEditClick(courseTest.Test)}>
                                  Изменить параметры
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate(`/teacher/statistic?testId=${courseTest.Test.id}&courseId=${courseId}`)}>
                                  Посмотреть результаты
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTestDeleteClick(courseTest.Test)} className="text-danger">
                                  Удалить с курса
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                          <div className="mt-2">
                            <div>Время: {courseTest.Test.timeLimit} мин</div>
                            <div>Попыток: {courseTest.attemptsAllowed}</div>
                            {courseTest.deadline && (
                              <div>Дедлайн: {new Date(courseTest.deadline).toLocaleDateString()}</div>
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

      <AddTreoryCourse
        show={showTheoryModal}
        onHide={() => setShowTheoryModal(false)}
        courseId={courseId}
        onSuccess={fetchCourseData}
      />

      <AddTestCourse
        show={showTestModal}
        onHide={() => setShowTestModal(false)}
        courseId={courseId}
        myTests={myTests}
        onSuccess={fetchCourseData}
      />

      <DeleteTheory
        show={showDeleteTheoryModal}
        onHide={() => setShowDeleteTheoryModal(false)}
        theory={selectedTheory}
        onTheoryDeleted={fetchCourseData}
      />

      <DeleteTest
        show={showDeleteTestModal}
        onHide={() => setShowDeleteTestModal(false)}
        test={selectedTest}
        courseId={courseId}
        onTestDeleted={fetchCourseData}
      />

      <UpdateSettingsTest
        show={showEditTestModal}
        onHide={() => setShowEditTestModal(false)}
        courseId={courseId}
        test={selectedTest}
        onTestUpdated={fetchCourseData}
      />
    </Container>
  )
}

export default CoursePage