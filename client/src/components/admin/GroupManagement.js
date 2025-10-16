import React, { useState, useEffect } from 'react'
import { Table, Button, Container, Card } from 'react-bootstrap'
import OpModal from '../modals/admin/OpGroup'
import DeleteGroup from '../modals/admin/DeleteGroup'
import { createGroup, fetchGroups, updateGroup } from '../../http/admin/groupAPI'
import { observer } from 'mobx-react-lite'

const GroupManagement = observer(() => {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentGroup, setCurrentGroup] = useState(null)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchGroupsData = async () => {
    try {
      const data = await fetchGroups()
      setGroups(data)
    } catch (error) {
      console.error('Ошибка при загрузке групп', error)
    }
  }

  useEffect(() => {
    fetchGroupsData()
  }, [])

  const handleCreate = () => {
    setCurrentGroup(null)
    setShowModal(true)
  }

  const handleEdit = (group) => {
    setCurrentGroup(group)
    setShowModal(true)
  }

  const handleDeleteClick = (group) => {
    setGroupToDelete(group)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false)
    setGroupToDelete(null)
    await fetchGroupsData()
  }

  const handleSubmit = async (values) => {
    setFormSubmitting(true)
    try {
      if (currentGroup) {
        await updateGroup(currentGroup.id, values)
      } else {
        await createGroup(values)
      }
      setShowModal(false)
      await fetchGroupsData()
    } catch (error) {
      console.error('Ошибка при сохранении', error)
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Управление группами</h1>
        <Button variant="primary" onClick={handleCreate}>
          Добавить группу
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Table responsive hover style={{ fontSize: '17px'}} className="mb-0">
            <thead>
              <tr>
                <th>Название группы</th>
                <th >Количество студентов</th>
                <th className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.users?.length || 0}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleEdit(group)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(group)}>
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

      <OpModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialValues={currentGroup}
        submitting={formSubmitting}
      />

      <DeleteGroup
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        group={groupToDelete}
      />
    </Container>
  )
})

export default GroupManagement