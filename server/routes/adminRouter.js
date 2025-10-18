const Router = require('express')
const router = new Router()
const adminController = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require('../middleware/checkRoleMiddleware')

router.use(authMiddleware)
router.use(checkRole('admin'))
//преподаватель
router.get('/teachers', adminController.getAllTeachers)
router.post('/teachers', adminController.createTeacher)
router.put('/teachers/:id', adminController.updateTeacher)
router.delete('/teachers/:id', adminController.deleteTeacher)
//студент
router.get('/students', adminController.getAllStudents)
router.post('/students', adminController.createStudent)
router.put('/students/:id', adminController.updateStudent)
router.delete('/students/:id', adminController.deleteStudent)
//группа
router.get('/groups', adminController.getAllGroups)
router.post('/groups', adminController.createGroup)
router.put('/groups/:id', adminController.updateGroup)
router.delete('/groups/:id', adminController.deleteGroup)

module.exports = router 