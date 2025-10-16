import AdminPanel from './pages/AdminPanel'
import AuthPage from './pages/AuthPage'
import TeacherPage from './pages/TeacherPage'
import StudentPage from './pages/StudentPage'
import About from './pages/About'
import { ADMIN_ROUTE, TEACHER_ROUTE, STUDENT_ROUTE, LOGIN_ROUTE, ABOUT_ROUTE } from "./utils/consts"

export const authRoutes = [
    {
        path: ADMIN_ROUTE + '/*',
        Component: AdminPanel
    },
    {
        path: TEACHER_ROUTE + '/*',
        Component: TeacherPage
    },
    {
        path: STUDENT_ROUTE + '/*',
        Component: StudentPage
    }
]

export const publicRoutes = [
    {
        path: LOGIN_ROUTE,
        Component: AuthPage
    },
    {
        path: ABOUT_ROUTE,
        Component: About
    }
]