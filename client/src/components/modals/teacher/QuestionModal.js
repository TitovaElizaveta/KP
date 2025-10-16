import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { createQuestion, updateQuestion } from '../../../http/teacher/questionAPI'

const QuestionModal = ({ show, onHide, mode, question, onQuestionUpdated }) => {
  const [text, setText] = useState('')
  const [type, setType] = useState('single')
  const [difficulty, setDifficulty] = useState('easy')
  const [points, setPoints] = useState(1)
  const [options, setOptions] = useState([{ text: '', isCorrect: false }])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [matchPairs, setMatchPairs] = useState({ leftItems: [''], rightItems: [''] })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && question) {
        setText(question.text)
        setType(question.type)
        setDifficulty(question.difficulty)
        setPoints(question.points)

        if (question.type === 'single' || question.type === 'many') {
          if (question.answerOptions && question.answerOptions.length > 0) {
            const formattedOptions = question.answerOptions.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect
            }))

            setOptions(formattedOptions)

            if (question.type === 'single') {
              const correctIndex = question.answerOptions.findIndex(opt => opt.isCorrect)
              if (correctIndex !== -1) {
                setCorrectAnswer(correctIndex.toString())
              }
            } else {
              const correctIndices = question.answerOptions
                .map((opt, index) => opt.isCorrect ? index.toString() : '')
                .filter(id => id !== '')
              setCorrectAnswer(correctIndices)
            }
          }
        }
        else if (question.type === 'write' && question.correctWrite) {
          setCorrectAnswer(question.correctWrite.correctText)
        }
        else if (question.type === 'match' && question.matchPairs) {
          const matchPair = Array.isArray(question.matchPairs)
            ? question.matchPairs[0]
            : question.matchPairs;

          if (matchPair) {
            const leftItems = matchPair.leftItems
              ? (typeof matchPair.leftItems === 'string'
                ? matchPair.leftItems.split(',')
                : matchPair.leftItems)
              : [''];

            const rightItems = matchPair.rightItems
              ? (typeof matchPair.rightItems === 'string'
                ? matchPair.rightItems.split(',')
                : matchPair.rightItems)
              : [''];

            setMatchPairs({
              leftItems,
              rightItems
            })
          }
        }
      } else {
        setText('')
        setType('single')
        setDifficulty('easy')
        setPoints(1)
        setOptions([{ text: '', isCorrect: false }])
        setCorrectAnswer('');
        setMatchPairs({ leftItems: [''], rightItems: [''] })
      }
      setError('')
    }
  }, [show, mode, question])

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
  };

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)

      if (type === 'single') {
        if (correctAnswer === index.toString()) {
          setCorrectAnswer('0')
        } else if (parseInt(correctAnswer) > index) {
          setCorrectAnswer((parseInt(correctAnswer) - 1).toString())
        }
      } else if (type === 'many') {
        const newCorrectAnswer = correctAnswer
          .filter(ans => ans !== index.toString())
          .map(ans => parseInt(ans) > index ? (parseInt(ans) - 1).toString() : ans)
        setCorrectAnswer(newCorrectAnswer)
      }
    }
  }

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  };

  const handleSingleCorrectAnswerChange = (index) => {
    setCorrectAnswer(index.toString())

    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }))
    setOptions(newOptions)
  }

  const handleManyCorrectAnswerChange = (index, isChecked) => {
    let newCorrectAnswer
    if (isChecked) {
      newCorrectAnswer = [...correctAnswer, index.toString()]
    } else {
      newCorrectAnswer = correctAnswer.filter(ans => ans !== index.toString())
    }
    setCorrectAnswer(newCorrectAnswer)

    const newOptions = [...options]
    newOptions[index].isCorrect = isChecked
    setOptions(newOptions)
  }

  const handleAddMatchPair = () => {
    setMatchPairs({
      leftItems: [...matchPairs.leftItems, ''],
      rightItems: [...matchPairs.rightItems, '']
    })
  }

  const handleRemoveMatchPair = (index) => {
    if (matchPairs.leftItems.length > 1) {
      const newLeftItems = [...matchPairs.leftItems]
      const newRightItems = [...matchPairs.rightItems]
      newLeftItems.splice(index, 1)
      newRightItems.splice(index, 1)
      setMatchPairs({ leftItems: newLeftItems, rightItems: newRightItems })
    }
  }

  const handleMatchPairChange = (index, side, value) => {
    const newItems = [...matchPairs[side]]
    newItems[index] = value
    setMatchPairs({ ...matchPairs, [side]: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      let questionData = {
        text,
        type,
        difficulty,
        points: parseInt(points)
      }

      if (type === 'single' || type === 'many') {
        const hasCorrect = type === 'single'
          ? correctAnswer !== ''
          : correctAnswer.length > 0

        if (!hasCorrect) {
          setError('Необходимо указать хотя бы один правильный вариант ответа')
          setIsSubmitting(false)
          return
        }

        questionData.options = options.map(opt => opt.text);

        if (type === 'single') {
          questionData.correctAnswer = parseInt(correctAnswer)
        } else {
          questionData.correctAnswer = correctAnswer.map(ans => parseInt(ans))
        }
      } else if (type === 'write') {
        if (!correctAnswer.trim()) {
          setError('Необходимо указать правильный ответ')
          setIsSubmitting(false)
          return
        }
        questionData.correctAnswer = correctAnswer
      } else if (type === 'match') {
        const hasEmpty = matchPairs.leftItems.some(item => !item.trim()) ||
          matchPairs.rightItems.some(item => !item.trim())
        if (hasEmpty) {
          setError('Все пары соответствия должны быть заполнены')
          setIsSubmitting(false)
          return
        }
        questionData.matchPairs = {
          leftItems: matchPairs.leftItems,
          rightItems: matchPairs.rightItems
        }
      }

      if (mode === 'create') {
        await createQuestion(questionData)
      } else if (mode === 'edit') {
        await updateQuestion(question.id, questionData)
      }

      onHide()
      if (onQuestionUpdated) onQuestionUpdated()
    } catch (error) {
      console.error('Ошибка при сохранении вопроса:', error)
      setError(error.response?.data?.message || 'Ошибка при сохранении вопроса')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'create' ? 'Создать вопрос' : 'Редактировать вопрос'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ fontSize: '17px' }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Текст вопроса</Form.Label>
            <Form.Control style={{ cursor: 'pointer' }} as="textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)}
              required
              placeholder="Введите текст вопроса"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Тип вопроса</Form.Label>
                <Form.Select style={{ cursor: 'pointer' }} value={type} onChange={(e) => setType(e.target.value)} disabled={mode === 'edit'}>
                  <option value="single">Один вариант</option>
                  <option value="many">Несколько вариантов</option>
                  <option value="write">Текстовый ответ</option>
                  <option value="match">Соответствие</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Сложность</Form.Label>
                <Form.Select style={{ cursor: 'pointer' }} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Баллы</Form.Label>
                <Form.Control style={{ cursor: 'pointer' }} type="number" min="1" value={points} onChange={(e) => setPoints(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {(type === 'single' || type === 'many') && (
            <div className="mb-3">
              <Form.Label>Варианты ответов</Form.Label>
              {options.map((option, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <Form.Check
                    type={type === 'single' ? 'radio' : 'checkbox'}
                    name={type === 'single' ? 'correctOption' : `option-${index}`}
                    checked={type === 'single'
                      ? correctAnswer === index.toString()
                      : correctAnswer.includes(index.toString())
                    }
                    onChange={(e) => {
                      if (type === 'single') {
                        handleSingleCorrectAnswerChange(index);
                      } else {
                        handleManyCorrectAnswerChange(index, e.target.checked);
                      }
                    }}
                    className="me-2"
                  />
                  <Form.Control style={{ cursor: 'pointer' }} type="text" value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder="Текст варианта ответа"
                    required
                  />
                  <Button variant="danger" size="sm" className="ms-2"
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" onClick={handleAddOption}>
                + Добавить вариант
              </Button>
            </div>
          )}

          {type === 'write' && (
            <Form.Group className="mb-3">
              <Form.Label>Правильный ответ</Form.Label>
              <Form.Control style={{ cursor: 'pointer' }} type="text" value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Введите правильный ответ"
                required
              />
            </Form.Group>
          )}

          {type === 'match' && (
            <div className="mb-3">
              <Form.Label className='mb-2'>Пары соответствия</Form.Label>
              {matchPairs.leftItems.map((_, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control className='mb-2' style={{ cursor: 'pointer' }} type="text" value={matchPairs.leftItems[index]}
                      onChange={(e) => handleMatchPairChange(index, 'leftItems', e.target.value)}
                      placeholder="Левый элемент"
                      required
                    />
                  </Col>
                  <Col md={1} className="text-center">→</Col>
                  <Col md={5}>
                    <Form.Control style={{ cursor: 'pointer' }} type="text" value={matchPairs.rightItems[index]}
                      onChange={(e) => handleMatchPairChange(index, 'rightItems', e.target.value)}
                      placeholder="Правый элемент"
                      required
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="danger" size="sm"
                      onClick={() => handleRemoveMatchPair(index)}
                      disabled={matchPairs.leftItems.length <= 1}
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button className='mt-2' variant="outline-primary" size="sm" onClick={handleAddMatchPair}>
                + Добавить пару
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default QuestionModal