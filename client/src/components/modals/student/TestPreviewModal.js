import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { checkTestAvailability } from '../../../http/student/testAPI'

const TestPreviewModal = ({ show, onHide, test, onConfirm }) => {
  const [actualTestData, setActualTestData] = useState(null)

  const fetchActualTestData = useCallback(async () => {
    if (!test) return
    try {
      const data = await checkTestAvailability(test.id)
      const updatedTestData = {
        ...test,
        studentAttempts: data.studentAttempts,
        remainingAttempts: data.remainingAttempts,
        isDeadlinePassed: data.isDeadlinePassed,
        canStartTest: data.canStartTest
      }
      setActualTestData(updatedTestData)
    } catch (error) {
      console.error('Ошибка при загрузке данных теста:', error)
      setActualTestData(test)
    }
  }, [test])

  useEffect(() => {
    if (show && test) {
      fetchActualTestData()
    }
  }, [show, test, fetchActualTestData])

  if (!test) return null;

  const currentTest = actualTestData || test

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAttemptsInfo = () => {
    let usedAttempts = 0

    if (typeof currentTest.studentAttempts === 'number') {
      usedAttempts = currentTest.studentAttempts
    } else if (typeof currentTest.attemptsUsed === 'number') {
      usedAttempts = currentTest.attemptsUsed
    }

    const remainingAttempts = currentTest.attemptsAllowed - usedAttempts

    return {
      used: usedAttempts,
      remaining: remainingAttempts,
      hasAttempts: remainingAttempts > 0
    }
  }

  const attemptsInfo = getAttemptsInfo()
  const isDeadlinePassed = currentTest.deadline && new Date() > new Date(currentTest.deadline)

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Подтверждение начала теста</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5 className="mb-3">{currentTest.title}</h5>
          {currentTest.description && (
            <p className="text-muted mb-3">{currentTest.description}</p>
          )}
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Время на выполнение:</strong>
            <div className="text-muted">{currentTest.timeLimit} минут</div>
          </Col>
          <Col md={6}>
            <strong>Дедлайн:</strong>
            <div className={isDeadlinePassed ? 'text-danger' : 'text-muted'}>
              {currentTest.deadline ? formatDate(currentTest.deadline) : 'Не установлен'}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Попытки:</strong>
            <div className="text-muted">
              Использовано: {attemptsInfo.used} из {currentTest.attemptsAllowed}
            </div>
          </Col>
          <Col md={6}>
            <strong>Осталось попыток:</strong>
            <div className={attemptsInfo.hasAttempts ? 'text-success' : 'text-danger'}>
              {attemptsInfo.remaining}
            </div>
          </Col>
        </Row>

        {isDeadlinePassed && (
          <h5 className="text-danger">
            <strong>Срок сдачи теста истек.</strong>
          </h5>
        )}

        {!attemptsInfo.hasAttempts && (
          <h5 className="text-danger">
            <strong>Вы использовали все попытки для этого теста.</strong>
          </h5>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={!attemptsInfo.hasAttempts || isDeadlinePassed}>
          Начать тест ({attemptsInfo.used + 1}-я попытка)
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default TestPreviewModal