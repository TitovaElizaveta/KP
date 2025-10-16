import React from 'react'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

const TeacherNavbar = () => {
  return (
    <Nav justify variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link as={Link} to="/teacher/courses">
          Мои курсы
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/teacher/tests">
          Мои тесты
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/teacher/questions">
          Банк вопросов
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

export default TeacherNavbar