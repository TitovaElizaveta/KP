const { Course, Theory, Test, TestAttempt, StudentAnswer, Question, AnswerOption, AnswerWrite, 
  MatchPairs, Group, UserGroup, GroupCourse, CourseTest, TestQuestion, } = require('../models/models')
const ApiError = require('../error/ApiError')
const sequelize = require('../db')
const path = require('path')
const fs = require('fs')

class StudentController {
  constructor() {
    this.endTest = this.endTest.bind(this)
    this.checkAnswerCorrectness = this.checkAnswerCorrectness.bind(this)
    this.checkMatchAnswer = this.checkMatchAnswer.bind(this)
  }
  //курс
  async getMyCourses(req, res, next) {
    try {
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId }
      })
      if (userGroups.length === 0) {
        return res.json([])
      }
      const groupIds = userGroups.map(ug => ug.id_group)
      const courses = await Course.findAll({
        include: [
          {
            model: Group,
            where: { id: groupIds },
            through: { attributes: [] }
          },
          {
            model: Test,
            through: { attributes: [] },
            required: false
          }
        ]
      })
      
      const formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        testCount: course.Tests ? course.Tests.length : 0
      }))
      res.json(formattedCourses)
    } catch (e) {
      console.error('Error in getMyCourses:', e)
      return next(ApiError.internal('Ошибка при получении курсов'))
    }
  }
  
  async getCourseDetails(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      if (userGroups.length === 0) {
        return next(ApiError.forbidden('Доступ к курсу запрещен'))
      }

      const groupIds = userGroups.map(ug => ug.id_group)
      const groupCourse = await GroupCourse.findOne({
        where: {
          id_course: id,
          id_group: groupIds
        }
      })

      if (!groupCourse) {
        return next(ApiError.forbidden('Доступ к курсу запрещен'));
      }
      
      const course = await Course.findByPk(id, {
        include: [
          {
            model: Theory,
            attributes: ['id', 'title', 'fileSize']
          },
          {
            model: Test,
            through: { attributes: ['deadline', 'isActive', 'attemptsAllowed'] }
          }
        ]
      })

      if (!course) {
        return next(ApiError.notFound('Курс не найден'))
      }

      res.json(course);

    } catch (e) {
      console.error('Error in getCourseDetails:', e)
      return next(ApiError.internal('Ошибка при получении курса'))
    }
  }
  //теория
  async getCourseTheory(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      if (userGroups.length === 0) {
        return next(ApiError.forbidden('Доступ запрещен'))
      }

      const groupIds = userGroups.map(ug => ug.id_group)
      const groupCourse = await GroupCourse.findOne({
        where: {
          id_course: id,
          id_group: groupIds
        }
      })

      if (!groupCourse) {
        return next(ApiError.forbidden('Доступ запрещен'));
      }

      const theories = await Theory.findAll({
        where: { id_course: id },
        attributes: ['id', 'title', 'fileSize']
      })
      res.json(theories)
    } catch (e) {
      console.error('Error in getCourseTheory:', e);
      return next(ApiError.internal('Ошибка при получении теории'))
    }
  }
  
  async downloadTheory(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })
      
      const groupIds = userGroups.map(ug => ug.id_group)
      const theory = await Theory.findOne({
        where: { id: id },
        include: [{
          model: Course,
          include: [{
            model: Group,
            where: { id: groupIds },
            through: { attributes: [] }
          }]
        }]
      })
      
      if (!theory) {
        return next(ApiError.notFound('Теория не найдена'))
      }
      
      const filePath = path.join(__dirname, '../uploads', theory.filePath)
      if (!fs.existsSync(filePath)) {
        return next(ApiError.notFound('Файл не найден'))
      }
      res.download(filePath, `${theory.title}.pdf`)

    } catch (e) {
      console.error('Error in downloadTheory:', e)
      return next(ApiError.internal('Ошибка при скачивании теории'))
    }
  }

  async viewTheory(req, res, next) {
    try {
      const { courseId, theoryId } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      if (userGroups.length === 0) {
        return next(ApiError.forbidden('Доступ к курсу запрещен'))
      }

      const groupIds = userGroups.map(ug => ug.id_group)
      const groupCourse = await GroupCourse.findOne({
        where: {
          id_course: courseId,
          id_group: groupIds
        }
      })

      if (!groupCourse) {
        return next(ApiError.forbidden('Доступ к курсу запрещен'))
      }

      const theory = await Theory.findOne({
        where: { 
          id: theoryId,
          id_course: courseId 
        }
      })

      if (!theory) {
        return next(ApiError.notFound('Теория не найдена в этом курсе'))
      }

      const filePath = path.join(__dirname, '../uploads', theory.filePath)
    
      if (!fs.existsSync(filePath)) {
        return next(ApiError.notFound('Файл не найден'))
      }

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline`)

      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)

    } catch (e) {
      console.error('Error in viewTheory:', e)
      return next(ApiError.internal('Ошибка при открытии теории'))
    }
  }

  //тест
  async getCourseTests(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      const groupIds = userGroups.map(ug => ug.id_group)
      const groupCourse = await GroupCourse.findOne({
        where: { id_course: id, id_group: groupIds }
      })
      if (!groupCourse) {
        return next(ApiError.forbidden('Доступ запрещен'))
      }

      const courseTests = await CourseTest.findAll({
        where: { id_course: id }
      })

      const testIds = courseTests.map(ct => ct.id_test)
      const tests = await Test.findAll({
        where: { id: testIds },
        include: [{
          model: TestAttempt,
          where: { id_student: studentId },
          required: false,
          attributes: ['id']
        }]
      })
      const formattedTests = tests.map(test => {
        const courseTest = courseTests.find(ct => ct.id_test === test.id)
        return {
          id: test.id,
          title: test.title,
          description: test.description,
          timeLimit: test.timeLimit,
          deadline: courseTest.deadline,
          attemptsAllowed: courseTest.attemptsAllowed,
          studentAttempts: test.TestAttempts,
          attemptsUsed: test.TestAttempts ? test.TestAttempts.length : 0//число попыток
        }
      })
      res.json(formattedTests)
    } catch (e) {
      console.error('Error in getCourseTests:', e)
      return next(ApiError.internal('Ошибка при получении тестов'))
    }
  }

  async startTest(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      const groupIds = userGroups.map(ug => ug.id_group)
      const groupCourses = await GroupCourse.findAll({
        where: { id_group: groupIds },
        attributes: ['id_course']
      })

      const courseIds = groupCourses.map(gc => gc.id_course)
      const courseTest = await CourseTest.findOne({
        where: { 
          id_test: id,
          id_course: courseIds
        }
      })

      if (!courseTest) {
        return res.status(403).json({ message: 'Доступ к тесту запрещен' });
      }
      
      const test = await Test.findByPk(id);
      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }
      if (courseTest.deadline && new Date() > new Date(courseTest.deadline)) {
        return res.status(400).json({ message: 'Срок сдачи теста истек' });
      }

      const attemptsCount = await TestAttempt.count({
        where: { id_test: id, id_student: studentId }
      })
      if (attemptsCount >= courseTest.attemptsAllowed) {
        return res.status(400).json({ message: 'Превышено количество попыток' });
      }

      const attempt = await TestAttempt.create({
        id_test: id,
        id_student: studentId,
        testStart: new Date(),
        attemptNumber: attemptsCount + 1
      })

      const testQuestions = await TestQuestion.findAll({
        where: { id_test: id },
        attributes: ['id_question'],
        order: [['id', 'ASC']]
      })

      const questionIds = testQuestions.map(tq => tq.id_question);
      const questions = await Question.findAll({
        where: { id: questionIds },
        order: [['id', 'ASC']]
      })

      const formattedQuestions = await Promise.all(
        questions.map(async (question) => {
          let options = [];
          let matchPairs = null

          if (question.type === 'single' || question.type === 'many') {
            options = await AnswerOption.findAll({
              where: { id_question: question.id },
              attributes: ['id', 'text']
            })
          }
          if (question.type === 'match') {
            matchPairs = await MatchPairs.findOne({
              where: { id_question: question.id }
            })
          }

          return {
            id: question.id,
            text: question.text,
            type: question.type,
            points: question.points,
            options: options,
            matchPairs: matchPairs
          }
        })
      )

      res.json({ 
        attemptId: attempt.id,
        timeLimit: test.timeLimit,
        questions: formattedQuestions
      })
    } catch (e) {
      console.error('Error in startTest:', e)
      return res.status(500).json({ message: 'Ошибка при начале теста' })
    }
  }
  
  async saveAnswer(req, res, next) {
    try {
      const { attemptId, questionId, answer } = req.body
      const studentId = req.user.id
      const attempt = await TestAttempt.findOne({
        where: { id: attemptId, id_student: studentId }
      })

      if (!attempt) {
        return res.status(400).json({ message: 'Попытка не найдена' })
      }

      if (attempt.isCompleted) {
        return res.status(400).json({ message: 'Тест уже завершен' })
      }

      const existingAnswer = await StudentAnswer.findOne({
        where: { 
          id_attempt: attemptId, 
          id_question: questionId 
        }
      })

      if (existingAnswer) {
        await existingAnswer.update({
          answerText: JSON.stringify(answer)
        })
      } else {
        await StudentAnswer.create({
          id_attempt: attemptId,
          id_question: questionId,
          id_student: studentId,
          answerText: JSON.stringify(answer)
        })
      }
      res.json({ message: 'Ответ сохранен' })

    } catch (e) {
      console.error('Error in saveAnswer:', e)
      return res.status(500).json({ message: 'Ошибка при сохранении ответа' })
    }
  }


  async endTest(req, res, next) {
    try {
      const { attemptId } = req.body
      const studentId = req.user.id

      const attempt = await TestAttempt.findOne({
        where: { id: attemptId, id_student: studentId }
      })

      if (!attempt) {
        return res.status(400).json({ message: 'Попытка не найдена' })
      }

      if (attempt.isCompleted) {
        return res.status(400).json({ message: 'Тест уже завершен' })
      }

      const studentAnswers = await StudentAnswer.findAll({
        where: { id_attempt: attemptId }
      })
      const questionIds = studentAnswers.map(answer => answer.id_question)
      const questions = await Question.findAll({
        where: { id: questionIds }
      })
      const questionMap = {}
      questions.forEach(question => {
        questionMap[question.id] = question;
      })

      let totalScore = 0
      let correctAnswers = 0

      for (const answer of studentAnswers) {
        const question = questionMap[answer.id_question];
      
        if (!question) {
          console.error(`Вопрос с ID ${answer.id_question} не найден в базе данных`)
          continue
        }
        const isCorrect = await this.checkAnswerCorrectness(question, answer.answerText)
        const points = isCorrect ? question.points : 0
        await answer.update({
          isCorrect,
          pointsEarned: points
        })

        if (isCorrect) correctAnswers++;
        totalScore += points;
      }

      const testQuestions = await TestQuestion.count({
        where: { id_test: attempt.id_test }
      })

      const totalQuestions = testQuestions;
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
      let grade;
      if (percentage >= 85) grade = 5;
      else if (percentage >= 70) grade = 4;
      else if (percentage >= 50) grade = 3;
      else grade = 2;

      await attempt.update({
        testEnd: new Date(),
        isCompleted: true,
        score: totalScore,
        grade: grade,
        timeSpent: Math.floor((new Date() - attempt.testStart) / 1000 / 60)
      })
      res.json({
        message: 'Тест завершен',
        score: totalScore,
        grade: grade,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions
      })

    } catch (e) {
      console.error('Error in submitTest:', e);
      return res.status(500).json({ message: 'Ошибка при завершении теста' });
    }
  }
  async checkAnswerCorrectness(question, studentAnswer) {
    try {
      if (!studentAnswer || studentAnswer === '""' || studentAnswer === 'null') {
        return false
      }
      let answer

      try {
        answer = JSON.parse(studentAnswer)
        console.log('Ответ после парсинга JSON:', answer)
      } catch (e) {
        console.log('Не удалось распарсить JSON, используем сырой ответ:', studentAnswer)
        answer = studentAnswer
      }

      switch (question.type){
        case 'single':
          console.log('Проверка одиночного выбора');
          const correctSingle = await AnswerOption.findOne({
            where: { id_question: question.id, isCorrect: true }
          })
        
          if (!correctSingle) {
            console.log('Правильный вариант не найден')
            return false
          }
          const resultSingle = answer == correctSingle.id;
          return resultSingle
        case 'many':
          console.log('Проверка множественного выбора');
          const correctMany = await AnswerOption.findAll({
            where: { id_question: question.id, isCorrect: true },
            attributes: ['id']
          })
        
          const correctIds = correctMany.map(opt => opt.id.toString()).sort();
          const studentIds = Array.isArray(answer) 
            ? answer.map(id => id.toString()).sort() 
            : [answer.toString()].sort()
            const resultMany = correctIds.length === studentIds.length && correctIds.every((val, index) => val === studentIds[index])
            console.log(`Результат: ${resultMany}`)
            return resultMany
        case 'write':
          const correctWrite = await AnswerWrite.findOne({
            where: { id_question: question.id }
          })
          if (!correctWrite) {
            return false;
          }
          const resultWrite = answer.toLowerCase().trim() === correctWrite.correctText.toLowerCase().trim()
          return resultWrite
        case 'match':
          return await this.checkMatchAnswer(question.id, answer);
        default:
          console.log(`Неизвестный тип вопроса: ${question.type}`)
          return false
      }
    } catch (e) {
      console.error('Error in checkAnswerCorrectness:', e)
      return false
    }
  }

  async checkMatchAnswer(questionId, studentAnswer) {
    try {
      const matchPairs = await MatchPairs.findOne({
        where: { id_question: questionId }
      })

      if (!matchPairs) {
        console.log('Пары для сопоставления не найдены')
        return false
      }

      const leftItems = matchPairs.leftItems.split(',').map(item => item.trim())
      const rightItems = matchPairs.rightItems.split(',').map(item => item.trim())
      const correctMap = {}
      for (let i = 0; i < Math.min(leftItems.length, rightItems.length); i++) {
        correctMap[i] = i
      }

      const studentPairs = {}
      if (studentAnswer && studentAnswer.trim()) {
        studentAnswer.split(',').forEach(pair => {
          const trimmedPair = pair.trim()
          if (trimmedPair) {
            const [leftNum, rightChar] = trimmedPair.split('-')
            if (leftNum && rightChar) {
              const leftIndex = parseInt(leftNum.trim()) - 1
              const rightIndex = rightChar.trim().toUpperCase().charCodeAt(0) - 65
              studentPairs[leftIndex] = rightIndex
            }
          }
        })
      }
      for (const leftIndex in correctMap) {
        if (studentPairs[leftIndex] !== correctMap[leftIndex]) {
          return false
        }
      }

      const result = Object.keys(studentPairs).length === Object.keys(correctMap).length
      console.log(`Результат проверки соответствия: ${result}`)
      return result

    } catch (e) {
      console.error('Оштбка checkMatchAnswer:', e)
      return false
    }
  }

  async getTestResults(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id

      const attempt = await TestAttempt.findOne({
        where: { id_test: id, id_student: studentId, isCompleted: true },
        order: [['createdAt', 'DESC']],
        include: [{
          model: Test,
          attributes: ['id', 'title', 'description']
        }]
      })

      if (!attempt) {
        return next(ApiError.notFound('Результаты не найдены'))
      }

      let testTitle = 'Неизвестный тест'
      let testDescription = ''
    
      if (attempt.Test) {
        testTitle = attempt.Test.title;
        testDescription = attempt.Test.description || ''
      } else {
        const test = await Test.findByPk(id)
        if (test) {
          testTitle = test.title;
          testDescription = test.description || ''
        }
      }
      const studentAnswers = await StudentAnswer.findAll({
        where: { id_attempt: attempt.id },
        include: [Question]
      })

      const correctAnswers = studentAnswers.filter(answer => answer.isCorrect).length
      const totalQuestions = await TestQuestion.count({ where: { id_test: id } })
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

      const courseTest = await CourseTest.findOne({
        where: { id_test: id }
      })

      const attemptsAllowed = courseTest ? courseTest.attemptsAllowed : 1
      const attemptsCount = await TestAttempt.count({
        where: { id_test: id, id_student: studentId }
      })

      const remainingAttempts = Math.max(0, attemptsAllowed - attemptsCount)

      res.json({
        attemptId: attempt.id,
        testId: attempt.id_test,
        testTitle: testTitle,
        testDescription: testDescription,
        score: attempt.score,
        grade: attempt.grade,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        percentage: percentage.toFixed(1),
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.updatedAt,
        attemptsAllowed: attemptsAllowed,
        attemptsUsed: attemptsCount,
        remainingAttempts: remainingAttempts,
        canRetake: remainingAttempts > 0,
        deadline: courseTest ? courseTest.deadline : null
      })

    } catch (e) {
      console.error('Error in getTestResults:', e)
      return next(ApiError.internal('Ошибка при получении результатов'))
    }
  }

  //результат тетса
  async checkTestAvailability(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id

      const userGroups = await UserGroup.findAll({
        where: { id_student: studentId },
        attributes: ['id_group']
      })

      const groupIds = userGroups.map(ug => ug.id_group)

      const groupCourses = await GroupCourse.findAll({
        where: { id_group: groupIds },
        attributes: ['id_course']
      })
      const courseIds = groupCourses.map(gc => gc.id_course)
      const courseTest = await CourseTest.findOne({
        where: { 
          id_test: id,
          id_course: courseIds
        }
      })

      if (!courseTest) {
        return next(ApiError.forbidden('Доступ к тесту запрещен'))
      }

      const test = await Test.findByPk(id)
      if (!test) {
        return next(ApiError.notFound('Тест не найден'))
      }

      const isDeadlinePassed = courseTest.deadline && new Date() > new Date(courseTest.deadline)

      const attemptsCount = await TestAttempt.count({
        where: { id_test: id, id_student: studentId }
      })
      const remainingAttempts = courseTest.attemptsAllowed - attemptsCount

      res.json({
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          timeLimit: test.timeLimit
        },
        courseTest: {
          deadline: courseTest.deadline,
          attemptsAllowed: courseTest.attemptsAllowed,
          isActive: courseTest.isActive
        },
        studentAttempts: attemptsCount,
        remainingAttempts: remainingAttempts,
        isDeadlinePassed: isDeadlinePassed,
        canStartTest: remainingAttempts > 0 && !isDeadlinePassed
      })

    } catch (e) {
      console.error('Error in checkTestAvailability:', e)
      return next(ApiError.internal('Ошибка при проверке доступности теста'))
    }
  }

  async getAttemptHistory(req, res, next) {
    try {
      const studentId = req.user.id
      const allAttempts = await TestAttempt.findAll({
        where: { id_student: studentId },
        include: [
          {
            model: Test,
            attributes: ['id', 'title', 'description'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      })

      const latestAttemptsMap = new Map()
      allAttempts.forEach(attempt => {
        const testId = attempt.id_test;
        if (!latestAttemptsMap.has(testId)) {
          latestAttemptsMap.set(testId, attempt);
        }
      })
      const latestAttempts = Array.from(latestAttemptsMap.values())
      const attemptsWithDetails = await Promise.all(
        latestAttempts.map(async (attempt) => {
          const attemptData = attempt.get({ plain: true });
          let courseName = 'Неизвестный курс'
          try {
            const courseTest = await CourseTest.findOne({
              where: { id_test: attempt.id_test }
            })
            if (courseTest) {
              const course = await Course.findByPk(courseTest.id_course);
              if (course) {
                courseName = course.title;
              }
            }
          } catch (error) {
            console.error('Error finding course:', error);
          }
          return {
            ...attemptData,
            courseName
          }
        })
      )

      res.json(attemptsWithDetails)
    } catch (e) {
      console.error('Error in getAttemptHistory:', e)
      return next(ApiError.internal('Ошибка при получении истории'))
    }
  }

  async getAttemptDetails(req, res, next) {
    try {
      const { id } = req.params
      const studentId = req.user.id
  
      if (!id || isNaN(parseInt(id))) {
      return next(ApiError.badRequest('Неверный ID попытки'))
      }

      const attempt = await TestAttempt.findOne({
        where: { 
          id: parseInt(id), 
          id_student: studentId
        },
        include: [
          {
            model: Test,
            attributes: ['id', 'title', 'description', 'timeLimit'],
            include: [{
              model: Question,
              through: { attributes: [] },
              include: [
                { 
                  model: AnswerOption, 
                  as: 'answerOptions',
                  attributes: ['id', 'text', 'isCorrect']
                },
                { 
                  model: AnswerWrite, 
                  as: 'correctWrite',
                  attributes: ['id', 'correctText']
                },
                { 
                  model: MatchPairs, 
                  as: 'matchPairs',
                  attributes: ['id', 'leftItems', 'rightItems']
                }
              ]
            }]
          },
          {
            model: StudentAnswer,
            attributes: ['id', 'id_question', 'answerText', 'isCorrect', 'pointsEarned']
          }
        ]
      })
      if (!attempt) {
      console.log('Attempt not found')
      return next(ApiError.notFound('Попытка не найдена'))
      }

      const attemptData = attempt.get({ plain: true })
      let courseName = 'Неизвестный курс'
      try {
        const courseTest = await CourseTest.findOne({
          where: { id_test: attempt.id_test }
        })
      
        if (courseTest && courseTest.id_course) {
          const course = await Course.findByPk(courseTest.id_course)
          if (course) {
            courseName = course.title
          }
        }
      } catch (error) {
        console.error('Error finding course:', error)
      }

      const result = {
        ...attemptData,
        courseName,
        questions: attemptData.test?.questions || [],
        studentAnswers: attemptData.studentAnswers || []
      }
      res.json(result)

    } catch (e) {
      console.error('Error in getAttemptDetails:', e)
      return next(ApiError.internal('Ошибка при получении деталей попытки'))
    }
  }
}
module.exports = new StudentController()