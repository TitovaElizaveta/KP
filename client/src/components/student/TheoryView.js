import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { viewTheory } from '../../http/student/coursesAPI'

const TheoryView = () => {
  const { courseId, theoryId } = useParams()
  const [pdfUrl, setPdfUrl] = useState('')

  useEffect(() => {
    const loadTheory = async () => {
      const response = await viewTheory(courseId, theoryId)
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
    }

    loadTheory()
  }, [courseId, theoryId])

  return (
    <Container fluid className="p-0" style={{ height: '100vh' }}>
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        title="PDF Viewer"
        style={{ border: 'none' }}
      />
    </Container>
  )
}

export default TheoryView