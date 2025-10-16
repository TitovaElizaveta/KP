import React from "react";
import StudentNavBar from '../components/castomNavBar/StudentNavBar' 
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import StudentCourses from '../components/student/StudentCourses'
import StudentResultTest from '../components/student/StudentResultTest'
import Calculator from '../components/student/Calculator'
import CourseStudentPage from "./CourseStudentPage"
import TheoryView from '../components/student/TheoryView'
import StudentTest from '../components/student/StudentTest'
import TestResult from '../components/student/TestResult'
import StudentTestReview from '../components/student/StudentTestReview'

const StudentPage = () => {
  const location = useLocation();
  const isTheoryView = location.pathname.includes('/theory/')

  return(
    <div>
      {!isTheoryView && <StudentNavBar/>}
      <div>
        <Routes>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<CourseStudentPage />} />
          <Route path="courses/:courseId/theory/:theoryId/view" element={<TheoryView />} />
          <Route path="tests/:testId/start" element={<StudentTest />} />
          <Route path="tests/:testId/results" element={<TestResult />} />
          
          <Route path="tests" element={<StudentResultTest />} />
          <Route path="tests/review/:attemptId" element={<StudentTestReview />} />

          <Route path="calculator" element={<Calculator />} />
        </Routes>
      </div>
    </div>
  )
}

export default StudentPage