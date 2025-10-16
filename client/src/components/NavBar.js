import React, { useContext } from "react"
import { Context } from "../index"
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Button } from 'react-bootstrap'
import { LOGIN_ROUTE } from '../utils/consts'
import { observer } from "mobx-react-lite"
import { useNavigate } from 'react-router-dom'

const NavBar = observer(() => {
  const { user } = useContext(Context)
  const navigate = useNavigate()

  const logOut = () => {
    user.setUser({})
    user.setIsAuth(false)
    localStorage.removeItem('token')
  }

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand className="position-absolute start-50 translate-middle-x">
          SimpleSet
        </Navbar.Brand>

        {user.isAuth ?
          <Nav className="ms-auto">
            <Button variant={'outline-light'} onClick={logOut}>
              Выйти
            </Button>
          </Nav>
          :
          <Nav className="ms-auto">
            <Button variant={'outline-light'} onClick={() => navigate(LOGIN_ROUTE)}>
              Войти
            </Button>
          </Nav>
        }
      </Container>
    </Navbar>
  )
})

export default NavBar