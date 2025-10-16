import React from 'react'
import { Routes, Route, Navigate} from 'react-router-dom'
import AdminNavbar from '../components/castomNavBar/AdminNavBar'
import TeacherManagement from '../components/admin/TeacherManagement'
import StudentManagement from '../components/admin/StudentManagement'
import GroupManagement from '../components/admin/GroupManagement'

const AdminPage = () => {
  return(
    <div>
      <AdminNavbar/>
      <div>
        <Routes>
          <Route index element={<Navigate to="teachers" replace />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="groups" element={<GroupManagement />} />
        </Routes>
      </div>
    </div>
  ) 
}

export default AdminPage