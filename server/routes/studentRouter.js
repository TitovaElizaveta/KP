const Router = require('express')
const router = new Router()
const studentController = require('../controllers/studentController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require('../middleware/checkRoleMiddleware')

router.use(authMiddleware)
router.use(checkRole('student'))
//курс
router.get('/courses', studentController.getMyCourses)
router.get('/courses/:id', studentController.getCourseDetails)
//теория
router.get('/courses/:id/theory', studentController.getCourseTheory);
router.get('/theory/:id/download', studentController.downloadTheory)
router.get('/courses/:courseId/theory/:theoryId/view', studentController.viewTheory)
//тетс
router.get('/courses/:id/tests', studentController.getCourseTests)
router.post('/tests/:id/start', studentController.startTest)
router.post('/tests/save-answer', studentController.saveAnswer)
router.post('/tests/complete', studentController.endTest)
router.get('/tests/:id/results', studentController.getTestResults)
//результат тетса
router.get('/tests/:id/check', studentController.checkTestAvailability);
router.get('/attempts/history', studentController.getAttemptHistory)
router.get('/attempts/:id/details', studentController.getAttemptDetails)

module.exports = router