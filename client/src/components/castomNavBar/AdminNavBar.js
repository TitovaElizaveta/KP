import React from 'react'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

const AdminNavbar = () => {
  return (
    <Nav justify variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link as={Link} to="/admin/teachers">
          Преподаватели
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/admin/students">
          Студенты
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/admin/groups">
          Группы
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default AdminNavbar;