import React from 'react'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

const StudentNavbar = () => {
  return (
    <Nav justify variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link as={Link} to="/student/courses">
          Мои дисциплины
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/student/tests">
          Мои результаты тестов
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/student/calculator">
          Калькулятор кольцевой суммы множеств
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

export default StudentNavbar