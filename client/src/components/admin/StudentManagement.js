import React, { useState, useEffect } from 'react'
import { Table, Button, Container, Card } from 'react-bootstrap'
import OpStudent from '../modals/admin/OpStudent'
import DeleteStudent from '../modals/admin/DeleteStudent'
import { createStudent, fetchStudents, updateStudent } from '../../http/admin/studentAPI'
import { fetchGroups } from '../../http/admin/groupAPI'
import { observer } from 'mobx-react-lite'

const StudentManagement = observer(() => {
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [studentsData, groupsData] = await Promise.all([
        fetchStudents(),
        fetchGroups()
      ])
      setStudents(studentsData)
      setGroups(groupsData)
    } catch (error) {
      console.error('Ошибка при загрузке данных',error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = () => {
    setCurrentStudent(null)
    setShowModal(true)
  }

  const handleEdit = (student) => {
    setCurrentStudent(student)
    setShowModal(true)
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false)
    setStudentToDelete(null)
    await fetchData()
  }

  const handleSubmit = async (values) => {
    setFormSubmitting(true)
    try {
      if (currentStudent) {
        await updateStudent(currentStudent.id, values)
      } else {
        await createStudent(values)
      }
      setShowModal(false)
      await fetchData()
    } catch (error) {
      console.error('Ошибка при сохранении', error)
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Управление студентами</h1>
        <Button variant="primary" onClick={handleCreate}>
          Добавить студента
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Table responsive hover style={{ fontSize: '17px'}} className="mb-0">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Почта</th>
                <th>Группа</th>
                <th className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{`${student.surname} ${student.name} ${student.last_name || ''}`.trim()}</td>
                    <td><a href={`mailto:${student.email}`}>{student.email}</a></td>
                    <td>{student.groups?.[0]?.name || 'Не назначена'}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleEdit(student)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(student)}>
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <OpStudent
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialValues={currentStudent}
        groups={groups}
        submitting={formSubmitting}
        title={currentStudent ? 'Редактирование студента' : 'Добавление студента'}
      />

      <DeleteStudent
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        student={studentToDelete}
      />
    </Container>
  )
})

export default StudentManagement