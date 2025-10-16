import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap'
import { observer } from 'mobx-react-lite'
import { getMyTests } from '../../http/teacher/testAPI'
import CreateTestModal from '../modals/teacher/CreateTestModal'
import EditTestModal from '../modals/teacher/EditTestModal'
import DeleteTestModal from '../modals/teacher/DeleteTestModal'

const TeacherTests = observer(() => {
  const [tests, setTests] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const data = await getMyTests()
      setTests(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching tests:', e)
    }
  }

  const handleEdit = (test) => {
    setSelectedTest(test)
    setShowEditModal(true)
  }

  const handleDelete = (test) => {
    if (!test?.id) {
      console.error('Test ID is undefined:', test)
      return
    }
    setSelectedTest(test)
    setShowDeleteModal(true)
  }

  const handleSuccess = () => {
    fetchTests()
  }

  const getQuestionsCount = (test) => {
    if (!test) return 0
    return Array.isArray(test.questions) ? test.questions.length : 0
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Мои тесты</h1>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Создать тест
            </Button>
          </div>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          {tests.length === 0 ? (
            <div className="text-center py-5">
              <h5>У вас пока нет тестов</h5>
              <p>Создайте свой первый тест</p>
            </div>
          ) : (
            <Table style={{ fontSize: '17px' }}  responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Описание</th>
                  <th>Время (мин)</th>
                  <th>Количество вопросов</th>

                  <th className="text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.description || 'Без описания'}</td>
                    <td><span>{test.timeLimit || 30} мин</span></td>
                    <td><span>{getQuestionsCount(test)} шт</span></td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleEdit(test)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(test)}>
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <CreateTestModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onTestCreated={handleSuccess}
      />

      <EditTestModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        test={selectedTest}
        onTestUpdated={handleSuccess}
      />

      <DeleteTestModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        test={selectedTest}
        onTestDeleted={handleSuccess}
      />
    </Container>
  )
})

export default TeacherTests