import React from "react"
import TeacherNavBar from '../components/castomNavBar/TeacherNavBar'
import { Routes, Route, Navigate} from 'react-router-dom'
import TeacherCourses from '../components/teacher/TeacherCourses'
import QuestionBank from '../components/teacher/QuestionBank'
import CoursePage from '../pages/CourseTeacherPage'
import TeacherTests from "../components/teacher/TeacherTests"
import TeacherTestView from "../components/teacher/TeacherTestView"
import TeacherStatistics from "../components/teacher/TeacherStatistics"
const TeacherPage = () => {
  return (
    <div>
      <TeacherNavBar />
      <div>
        <Routes>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/:courseId" element={<CoursePage />} />
          <Route path="tests/:testId" element={<TeacherTestView />} />
          <Route path="statistic" element={<TeacherStatistics />} />

          <Route path="tests" element={<TeacherTests />} />
          <Route path="questions" element={<QuestionBank />} />
        </Routes>
      </div>
    </div>
  )
}

export default TeacherPage