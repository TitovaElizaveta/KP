import { observer } from "mobx-react-lite"
import React, { useState, useContext } from "react"
import { Container, Form, Button, Alert } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { login } from '../http/authAPI'
import { Context } from '../index'
import { useNavigate, Link } from 'react-router-dom'

const AuthPage = observer(() => {
  const { user } = useContext(Context)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await login(email, password)
      user.setUser(response.user)
      user.setIsAuth(true)

      switch (response.user.role) {
        case 'admin':
          navigate('/admin')
          break
        case 'teacher':
          navigate('/teacher')
          break
        case 'student':
          navigate('/student')
          break
        default:
          navigate('/')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка авторизации')
    }
  };

  return (
    <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div>
        <Card style={{ width: 500 }} className='p-4 shadow'>
          <h2 className="m-auto mb-3">Войти</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} className='d-flex flex-column'>
            <Form.Control className='mt-3' type="email" placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ cursor: 'pointer' }}
            />
            <Form.Control className='mt-4 mb-2' type="password" placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ cursor: 'pointer' }}
            />
            <Button className='mt-3' variant="primary" type="submit" size="lg">
              Войти
            </Button>
          </Form>
        </Card>
        <div className="mt-1" style={{ textAlign: 'left', marginLeft: '15px' }}>
          <Link to="/about" style={{ fontSize: '14px', textDecoration: 'none', }}>
            О проекте
          </Link>
        </div>
      </div>
    </Container>
  )
})

export default AuthPage