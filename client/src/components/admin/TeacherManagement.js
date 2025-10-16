import React, { useState, useEffect } from 'react'
import { Table, Button, Container, Card } from 'react-bootstrap'
import OpTeacher from '../modals/admin/OpTeacher'
import DeleteTeacher from '../modals/admin/DeleteTeacher'
import { createTeacher, fetchTeachers, updateTeacher } from '../../http/admin/teacherAPI'
import { observer } from 'mobx-react-lite'

const TeacherManagement = observer(() => {
  const [teachers, setTeachers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentTeacher, setCurrentTeacher] = useState(null)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const teachersData = await fetchTeachers()
      setTeachers(teachersData)
    } catch (error) {
      console.error('Ошибка при загрузке данных', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = () => {
    setCurrentTeacher(null)
    setShowModal(true)
  }

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher)
    setShowModal(true)
  }

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false)
    setTeacherToDelete(null)
    await fetchData()
  }

  const handleSubmit = async (values) => {
    setFormSubmitting(true)
    try {
      if (currentTeacher) {
        await updateTeacher(currentTeacher.id, values)
      } else {
        await createTeacher(values)
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
        <h1>Управление преподавателями</h1>
        <Button variant="primary" onClick={handleCreate}>
          Добавить преподавателя
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Table responsive hover style={{ fontSize: '17px'}} className="mb-0">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Почта</th>
                <th className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{`${teacher.surname} ${teacher.name} ${teacher.last_name || ''}`.trim()}</td>
                    <td><a href={`mailto:${teacher.email}`}>{teacher.email}</a></td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleEdit(teacher)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(teacher)}>
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <OpTeacher
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialValues={currentTeacher}
        submitting={formSubmitting}
        title={currentTeacher ? 'Редактирование преподавателя' : 'Добавление преподавателя'}
      />
      <DeleteTeacher
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        teacher={teacherToDelete}
      />
    </Container>
  )
})
export default TeacherManagement