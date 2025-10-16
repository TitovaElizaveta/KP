const Router = require('express')
const router = new Router()

const authRouter = require('./authRouter')
const teacherRouter = require('./teacherRouter')
const studentRouter = require('./studentRouter')
const adminRouter = require('./adminRouter')

router.use('/auth', authRouter)
router.use('/teacher', teacherRouter)
router.use('/student', studentRouter)
router.use('/admin', adminRouter)

module.exports = router