import React from 'react'
import { Container } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="mt-4 d-flex flex-column justify-content-center" style={{ maxWidth: '1000px', minHeight: 'calc(100vh - 200px)' }}>
      <h2 className="mb-4">О ПРОЕКТЕ</h2>
      <div style={{ fontSize: '20px' }}>
        <p>
          Данный образовательный веб-ресурс представляет собой курсовым проектом студента АГТУ,
          обучающегося на 2-ом курсе в группе ДИНРБ-21 Титова Е. Д.
        </p>
        <p>
          Платформа разработана для изучения, визуализации и практического применения операции над
          множествами: "Кольцевая сумма".
        </p>
        <p>
          Проект реализован с помощью: HTML, CSS, JavaScript, Node.js, Express, React и PostgreSQL.
        </p>
      </div>
    </Container>
  )
}

export default About