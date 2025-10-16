import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { getStudentStatistics, getGroupStatistics, filterStudentStatistics, filterGroupStatistics } from '../../http/teacher/statisticAPI'

const TeacherStatistics = () => {
  const [searchParams] = useSearchParams()
  const testId = searchParams.get('testId')
  const courseId = searchParams.get('courseId')

  const [activeTab, setActiveTab] = useState('students')
  const [studentStats, setStudentStats] = useState([])
  const [groupStats, setGroupStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [studentFilters, setStudentFilters] = useState({
    sortBy: 'score',
    sortOrder: 'desc',
    groupName: ''
  })

  const [groupFilters, setGroupFilters] = useState({
    sortBy: 'averageGrade',
    sortOrder: 'desc'
  })

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)

      if (!testId) {
        setError('ID теста не указан')
        return
      }

      const studentsData = await getStudentStatistics(testId)
      setStudentStats(studentsData)

      if (courseId) {
        try {
          const groupsData = await getGroupStatistics(courseId)
          setGroupStats(groupsData)

          if (groupsData && groupsData.length === 0) {
            console.log('Group statistics is empty array, but this is OK if no groups have completed tests')
          }
        } catch (groupError) {
          setGroupStats([])
        }
      } else {
        setGroupStats([])
      }

    } catch (error) {
      setError('Ошибка при загрузке статистики')
    } finally {
      setLoading(false)
    }
  }, [testId, courseId])

  useEffect(() => {
    if (testId) {
      fetchStatistics()
    }
  }, [testId, fetchStatistics])

  const handleStudentFilter = async () => {
    try {
      const filteredData = await filterStudentStatistics(testId, studentFilters)
      setStudentStats(filteredData)
    } catch (error) {
      setError('Ошибка при фильтрации данных')
    }
  }

  const handleGroupFilter = async () => {
    try {
      if (!courseId) {
        setError('Не удалось определить курс для фильтрации групп')
        return
      }
      const filteredData = await filterGroupStatistics(courseId, groupFilters)
      setGroupStats(filteredData)
    } catch (error) {
      setError('Ошибка при фильтрации данных групп')
    }
  }

  const resetStudentFilters = () => {
    setStudentFilters({
      sortBy: 'score',
      sortOrder: 'desc',
      groupName: ''
    })
    fetchStatistics()
  }

  const resetGroupFilters = () => {
    setGroupFilters({
      sortBy: 'averageGrade',
      sortOrder: 'desc'
    })
    fetchStatistics()
  }

  const uniqueGroups = [...new Set(studentStats.map(stat => stat.student.group))].filter(Boolean)

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">Загрузка статистики...</div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Статистика по тесту</h1>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="students" title="Статистика по студентам">
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Сортировка по</Form.Label>
                    <Form.Select style={{cursor: 'pointer'}} value={studentFilters.sortBy} onChange={(e) => setStudentFilters({ ...studentFilters, sortBy: e.target.value })}>
                      <option value="score">Баллам</option>
                      <option value="grade">Оценке</option>
                      <option value="timeSpent">Времени</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Порядок</Form.Label>
                    <Form.Select style={{cursor: 'pointer'}} value={studentFilters.sortOrder} onChange={(e) => setStudentFilters({ ...studentFilters, sortOrder: e.target.value })}>
                      <option value="desc">По убыванию</option>
                      <option value="asc">По возрастанию</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Группа</Form.Label>
                    <Form.Select style={{cursor: 'pointer'}} value={studentFilters.groupName} onChange={(e) => setStudentFilters({ ...studentFilters, groupName: e.target.value })}>
                      {uniqueGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <div className="d-flex justify-content-end gap-2 w-100">
                    <Button variant="primary" onClick={handleStudentFilter}>
                      Применить
                    </Button>
                    <Button variant="outline-secondary" onClick={resetStudentFilters}>
                      Сбросить
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              <Table responsive hover style={{ fontSize: '17px' }}>
                <thead>
                  <tr>
                    <th>Студент</th>
                    <th>Группа</th>
                    <th>Оценка</th>
                    <th>Баллы</th>
                    <th>Время (мин)</th>
                    <th>Попытка</th>
                    <th>Дата завершения</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat.student.name}</td>
                      <td>{stat.student.group}</td>
                      <td>{stat.grade}</td>
                      <td>{stat.score}</td>
                      <td>{stat.timeSpent || '—'}</td>
                      <td>{stat.attemptNumber}</td>
                      <td>{stat.testEnd ? new Date(stat.testEnd).toLocaleDateString('ru-RU') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {studentStats.length === 0 && (
                <div className="text-center py-4 text-muted">
                  Нет данных для отображения
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="groups" title="Статистика по группам">
          {!courseId ? (
            <Alert variant="warning">
              Для просмотра статистики по группам необходим идентификатор курса.
              Убедитесь, что вы переходите на страницу статистики из страницы курса.
            </Alert>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Сортировка по</Form.Label>
                        <Form.Select style={{cursor: 'pointer'}} value={groupFilters.sortBy} onChange={(e) => setGroupFilters({ ...groupFilters, sortBy: e.target.value })}>
                          <option value="averageGrade">Средней оценке</option>
                          <option value="averageScore">Средним баллам</option>
                          <option value="averageTime">Среднему времени</option>
                          <option value="groupName">Названию группы</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Порядок</Form.Label>
                        <Form.Select style={{cursor: 'pointer'}} value={groupFilters.sortOrder} onChange={(e) => setGroupFilters({ ...groupFilters, sortOrder: e.target.value })}>
                          <option value="desc">По убыванию</option>
                          <option value="asc">По возрастанию</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <div className="d-flex justify-content-end gap-2 w-100">
                        <Button variant="primary" onClick={handleGroupFilter}>
                          Применить
                        </Button>
                        <Button variant="outline-secondary" onClick={resetGroupFilters}>
                          Сбросить
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body className="p-0">
                  <Table responsive hover style={{ fontSize: '17px' }}>
                    <thead>
                      <tr>
                        <th>Группа</th>
                        <th>Всего студентов</th>
                        <th>Завершенных тестов</th>
                        <th>Средняя оценка</th>
                        <th>Средние баллы</th>
                        <th>Среднее время (мин)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupStats && groupStats.length > 0 ? (
                        groupStats.map((group, index) => (
                          <tr key={index}>
                            <td>{group.groupName}</td>
                            <td>{group.totalStudents}</td>
                            <td>{group.completedTests}</td>
                            <td>{group.averageGrade}</td>
                            <td>{group.averageScore}</td>
                            <td>{group.averageTime}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            Нет данных по группам для этого курса
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}
        </Tab>
      </Tabs>
    </Container>
  )
}

export default TeacherStatistics