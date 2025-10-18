const Router = require('express')
const router = new Router()
const teacherController = require('../controllers/teacherController')
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware')

router.use(authMiddleware)
//курс
router.get('/courses', teacherController.getMyCourses)
router.post('/courses', teacherController.createCourse)
router.put('/courses/:id', teacherController.updateCourse)
router.delete('/courses/:id', teacherController.deleteCourse)
router.get('/courses/:id', teacherController.getCourseById)
router.get('/groups', teacherController.getAllGroups)
router.post('/courses/:id/groups', teacherController.addGroupsToCourse)
router.delete('/courses/:id/groups', teacherController.removeGroupsFromCourse)
//теория
router.post('/courses/:courseId/theory', uploadMiddleware, teacherController.uploadTheory)
router.delete('/theory/:theoryId', teacherController.deleteTheory)
router.get('/courses/:id/theory', teacherController.getCourseTheory)
//банк вопросов
router.get('/questions', teacherController.getMyQuestions)
router.post('/questions', teacherController.createQuestion)
router.get('/questions/search', teacherController.searchQuestions)
router.put('/questions/:questionId', teacherController.updateQuestion)
router.delete('/questions/:questionId', teacherController.deleteQuestion)
//тест
router.get('/tests', teacherController.getMyTests)                        
router.get('/courses/:courseId/tests', teacherController.getCourseTests)
router.post('/tests', teacherController.createTest)
router.put('/tests/:id', teacherController.updateTest)
router.delete('/tests/:id', teacherController.deleteTest)
router.get('/tests/:id', teacherController.getTestById)
router.get('/tests/:id/questions', teacherController.getTestQuestions);
router.post('/tests/:id/questions', teacherController.addQuestionsToTest);
router.delete('/tests/:id/questions', teacherController.removeQuestionsFromTest);
//свяка теста с курсом
router.post('/courses/:courseId/tests/:testId/attach', teacherController.attachTestToCourse);
router.put('/courses/:courseId/tests/:testId', teacherController.updateCourseTest);
router.delete('/courses/:courseId/tests/:testId', teacherController.detachTestFromCourse);
//статистика
router.get('/tests/:testId/statistics/students', teacherController.getStudentStatistics)
router.get('/tests/:testId/statistics/filter', teacherController.filterStudentStatistics)
router.get('/courses/:courseId/statistics/groups', teacherController.getGroupStatistics)
router.get('/courses/:courseId/statistics/groups/filter', teacherController.filterGroupStatistics)

module.exports = router