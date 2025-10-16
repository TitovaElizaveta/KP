const { Course, Theory, Test, TestAttempt, StudentAnswer, Question, AnswerOption, AnswerWrite, MatchPairs,
  Group, GroupCourse, CourseTest, TestQuestion, User } = require('../models/models')
const ApiError = require('../error/ApiError')
const sequelize = require('../db')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')

class TeacherController {
  //курс
  async getMyCourses(req, res, next) {
    try {
      const teacherId = req.user.id

      const courses = await Course.findAll({
        where: { id_teacher: teacherId },
        include: [{
          model: Group,
          through: { attributes: [] }
        }]
      })
      res.json(courses)

    } catch (e) {
      console.error('Error in getMyCourses:', e)
      return next(ApiError.internal('Ошибка при получении курсов'))
    }
  }

  async createCourse(req, res, next) {
    try {
      const teacherId = req.user.id
      const { title, groupIds } = req.body

      if (!title) {
        return next(ApiError.badRequest('Название курса обязательно'))
      }

      const course = await Course.create({
        title,
        id_teacher: teacherId
      })

      if (groupIds && groupIds.length > 0) {
        const groupCourseRecords = groupIds.map(groupId => ({
          id_course: course.id,
          id_group: groupId
        }))
        await GroupCourse.bulkCreate(groupCourseRecords)
      }
      res.json(course)

    } catch (e) {
      console.error('Error in createCourse:', e)
      return next(ApiError.internal('Ошибка при создании курса'))
    }
  }

  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;
      const { title, groupIds } = req.body;

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId }
      });

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'));
      }
      await course.update({ title: title || course.title });

      if (groupIds !== undefined) {
        await GroupCourse.destroy({ where: { id_course: id } });
        if (groupIds && groupIds.length > 0) {
          const groupCourseRecords = groupIds.map(groupId => ({
            id_course: course.id,
            id_group: groupId
          }));
          await GroupCourse.bulkCreate(groupCourseRecords);
        }
      }

      const updatedCourse = await Course.findByPk(id, {
        include: [{
          model: Group,
          through: { attributes: [] }
        }]
      });

      res.json(updatedCourse);
    } catch (e) {
      console.error('Error in updateCourse:', e);
      return next(ApiError.internal('Ошибка при обновлении курса'));
    }
  }

  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId }
      })
      await GroupCourse.destroy({ where: { id_course: id } })
      await CourseTest.destroy({ where: { id_course: id } })

      const theories = await Theory.findAll({ where: { id_course: id } })
      for (const theory of theories) {
        const filePath = path.join(__dirname, '../uploads', theory.filePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        await theory.destroy()
      }
      await course.destroy()
      res.json({ message: 'Курс успешно удален' })
    } catch (e) {
      console.error('Error in deleteCourse:', e)
      return next(ApiError.internal('Ошибка при удалении курса'))
    }
  }

  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'surname', 'last_name', 'email']
          },
          {
            model: Theory,
            attributes: ['id', 'title', 'filePath', 'fileSize']
          },
          {
            model: Test,
            through: {
              attributes: ['deadline', 'isActive', 'attemptsAllowed']
            },
            include: [
              {
                model: User,
                as: 'creater',
                attributes: ['name', 'surname']
              },

            ]
          },
          {
            model: Group,
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ]
      })
      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'));
      }
      res.json(course);
    } catch (e) {
      console.error('Error in getCourseById:', e);
      return next(ApiError.internal('Ошибка при получении курса'));
    }
  }

  async getAllGroups(req, res, next) {
    try {
      const groups = await Group.findAll({
        order: [['name', 'ASC']]
      });
      res.json(groups);
    } catch (e) {
      console.error('Error in getAllGroups:', e);
      return next(ApiError.internal('Ошибка при получении списка групп'));
    }
  }

  async addGroupsToCourse(req, res, next) {
    try {
      const { id } = req.params
      const { groupIds } = req.body
      const teacherId = req.user.id

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'))
      }

      const groupCourseRecords = groupIds.map(groupId => ({
        id_course: id,
        id_group: groupId
      }))

      await GroupCourse.bulkCreate(groupCourseRecords)
      res.json({ message: 'Группы успешно добавлены на курс' })

    } catch (e) {
      console.error('Error in addGroupsToCourse:', e)
      return next(ApiError.internal('Ошибка при добавлении групп'))
    }
  }

  async removeGroupsFromCourse(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id
      const { groupIds } = req.body

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'))
      }

      await GroupCourse.destroy({
        where: {
          id_course: id,
          id_group: { [Op.in]: groupIds }
        }
      })
      res.json({ message: 'Группы успешно удалены с курса' })

    } catch (e) {
      console.error('Error in removeGroupsFromCourse:', e)
      return next(ApiError.internal('Ошибка при удалении групп'))
    }
  }

  //теория
  async uploadTheory(req, res, next) {
    try {
      const { courseId } = req.params
      const teacherId = req.user.id
      const { title } = req.body

      if (!req.file) {
        return next(ApiError.badRequest('Файл не был загружен'))
      }

      const course = await Course.findOne({
        where: { id: courseId, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'))
      }

      const theory = await Theory.create({
        title: title || req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
        id_course: courseId
      })

      res.json(theory)

    } catch (e) {
      console.error('Error in uploadTheory:', e)
      return next(ApiError.internal('Ошибка при загрузке теории'))
    }
  }

  async deleteTheory(req, res, next) {
    try {
      const { theoryId } = req.params
      const teacherId = req.user.id

      const theory = await Theory.findOne({
        where: { id: theoryId },
        include: [{
          model: Course,
          where: { id_teacher: teacherId }
        }]
      })

      if (!theory) {
        return next(ApiError.forbidden('Теория не найдена или доступ запрещен'))
      }

      const filePath = path.join(__dirname, '../uploads', theory.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      await theory.destroy()
      res.json({ message: 'Теория успешно удалена' })

    } catch (e) {
      console.error('Error in deleteTheory:', e)
      return next(ApiError.internal('Ошибка при удалении теории'))
    }
  }

  async getCourseTheory(req, res, next) {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const course = await Course.findOne({
        where: { id, id_teacher: teacherId }
      });

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'));
      }

      const theories = await Theory.findAll({
        where: { id_course: id },
        attributes: ['id', 'title', 'filePath', 'fileSize', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      res.json(theories);
    } catch (e) {
      console.error('Error in getCourseTheory:', e);
      return next(ApiError.internal('Ошибка при получении материалов курса'));
    }
  }

  //вопросы
  async getMyQuestions(req, res, next) {
    try {
      const teacherId = req.user.id
      const { type, difficulty, search, page = 1, limit = 10 } = req.query
      const whereClause = { createdBy: teacherId }

      if (type) whereClause.type = type
      if (difficulty) whereClause.difficulty = difficulty
      if (search) whereClause.text = { [Op.iLike]: `%${search}%` }
      const offset = (page - 1) * limit

      const questions = await Question.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creater',
            attributes: ['id', 'name', 'surname']
          },
          { model: AnswerOption, as: 'answerOptions', required: false },
          { model: AnswerWrite, as: 'correctWrite', required: false },
          { model: MatchPairs, as: 'matchPairs', required: false }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      })
      res.json({
        questions: questions.rows,
        totalCount: questions.count,
        totalPages: Math.ceil(questions.count / limit),
        currentPage: parseInt(page)
      })

    } catch (e) {
      console.error('Error in getMyQuestions:', e)
      return next(ApiError.internal('Ошибка при получении вопросов'))
    }
  }

  async createQuestion(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { text, type, difficulty, points, options, correctAnswer, matchPairs } = req.body
      if (!text || !type || !difficulty) {
        return next(ApiError.badRequest('Обязательные поля: text, type, difficulty'))
      }

      const question = await Question.create({
        text,
        type,
        difficulty,
        points: points || 1,
        createdBy: teacherId
      })


      switch (type) {
        case 'single':
        case 'many':
          if (!options || !correctAnswer) {
            return next(ApiError.badRequest('Для этого типа вопроса нужны options и correctAnswer'))
          }
          const answerOptions = options.map((optionText, index) => {
            let isCorrect = false;
            if (type === 'single') {
              isCorrect = index === correctAnswer;
            } else if (type === 'many') {
              isCorrect = Array.isArray(correctAnswer)
                ? correctAnswer.includes(index)
                : false
            }
            return {
              text: optionText,
              isCorrect,
              id_question: question.id
            }
          })

          await AnswerOption.bulkCreate(answerOptions);
          break
        case 'write':
          if (!correctAnswer) {
            return next(ApiError.badRequest('Для этого типа вопроса нужен correctAnswer'))
          }
          await AnswerWrite.create({
            correctText: correctAnswer,
            id_question: question.id
          })
          break
        case 'match':
          if (!matchPairs || !matchPairs.leftItems || !matchPairs.rightItems) {
            return next(ApiError.badRequest('Для этого типа вопроса нужны matchPairs'))
          }
          await MatchPairs.create({
            leftItems: Array.isArray(matchPairs.leftItems) ?
              matchPairs.leftItems.join(',') :
              matchPairs.leftItems,
            rightItems: Array.isArray(matchPairs.rightItems) ?
              matchPairs.rightItems.join(',') :
              matchPairs.rightItems,
            id_question: question.id
          })
          break
      }
      res.json({
        id: question.id,
        message: 'Вопрос успешно создан'
      })

    } catch (e) {
      console.error('Error in createQuestion:', e);
      return next(ApiError.internal('Ошибка при создании вопроса: ' + e.message))
    }
  }

  async searchQuestions(req, res, next) {
    try {
      const { search, type, difficulty, page = 1, limit = 10 } = req.query
      const whereClause = {}
      if (search) whereClause.text = { [Op.iLike]: `%${search}%` }
      if (type) whereClause.type = type
      if (difficulty) whereClause.difficulty = difficulty

      const offset = (page - 1) * limit

      const questions = await Question.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creater',
            attributes: ['id', 'name', 'surname']
          },
          { model: AnswerOption, as: 'answerOptions', required: false },
          { model: AnswerWrite, as: 'correctWrite', required: false },
          { model: MatchPairs, as: 'matchPairs', required: false }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      })

      res.json({
        questions: questions.rows,
        totalCount: questions.count,
        totalPages: Math.ceil(questions.count / limit),
        currentPage: parseInt(page)
      })

    } catch (e) {
      console.error('Error in searchQuestions:', e)
      return next(ApiError.internal('Ошибка при поиске вопросов'))
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const { questionId } = req.params;
      const teacherId = req.user.id;
      const { text, difficulty, points, options, correctAnswer, matchPairs } = req.body

      const question = await Question.findOne({
        where: { id: questionId, createdBy: teacherId }
      })

      if (!question) {
        return next(ApiError.forbidden('Вопрос не найден или доступ запрещен'))
      }

      await question.update({
        text: text || question.text,
        difficulty: difficulty || question.difficulty,
        points: points || question.points
      })

      await AnswerOption.destroy({ where: { id_question: questionId } })
      await AnswerWrite.destroy({ where: { id_question: questionId } })
      await MatchPairs.destroy({ where: { id_question: questionId } })

      switch (question.type) {
        case 'single':
          if (!options || correctAnswer === undefined) {
            return next(ApiError.badRequest('Для этого типа вопроса нужны options и correctAnswer'))
          }
          const singleOptions = options.map((optionText, index) => ({
            text: optionText,
            isCorrect: index === parseInt(correctAnswer),
            id_question: questionId
          }));
          await AnswerOption.bulkCreate(singleOptions)
          break;

        case 'many':
          if (!options || correctAnswer === undefined) {
            return next(ApiError.badRequest('Для этого типа вопроса нужны options и correctAnswer'))
          }
          const manyOptions = options.map((optionText, index) => {
            let isCorrect = false;

            if (Array.isArray(correctAnswer)) {
              isCorrect = correctAnswer.some(answer =>
                parseInt(answer) === index || answer === index.toString()
              );
            } else {
              const answers = String(correctAnswer).split(',').map(a => a.trim());
              isCorrect = answers.some(answer =>
                parseInt(answer) === index || answer === index.toString()
              )
            }

            return {
              text: optionText,
              isCorrect,
              id_question: questionId
            }
          })
          await AnswerOption.bulkCreate(manyOptions)
          break

        case 'write':
          if (!correctAnswer) {
            return next(ApiError.badRequest('Для этого типа вопроса нужен correctAnswer'))
          }
          await AnswerWrite.create({
            correctText: correctAnswer,
            id_question: questionId
          })
          break

        case 'match':
          if (!matchPairs || !matchPairs.leftItems || !matchPairs.rightItems) {
            return next(ApiError.badRequest('Для этого типа вопроса нужны matchPairs'))
          }
          await MatchPairs.create({
            leftItems: Array.isArray(matchPairs.leftItems) ?
              matchPairs.leftItems.join(',') :
              matchPairs.leftItems,
            rightItems: Array.isArray(matchPairs.rightItems) ?
              matchPairs.rightItems.join(',') :
              matchPairs.rightItems,
            id_question: questionId
          })
          break
      }

      const updatedQuestion = await Question.findByPk(questionId, {
        include: [
          {
            model: User,
            as: 'creater',
            attributes: ['id', 'name', 'surname']
          },
          { model: AnswerOption, as: 'answerOptions' },
          { model: AnswerWrite, as: 'correctWrite' },
          { model: MatchPairs, as: 'matchPairs' }
        ]
      })
      res.json(updatedQuestion)

    } catch (e) {
      console.error('Error in updateQuestion:', e)
      return next(ApiError.internal('Ошибка при обновлении вопроса: ' + e.message))
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const { questionId } = req.params
      const teacherId = req.user.id
      const question = await Question.findOne({
        where: { id: questionId, createdBy: teacherId }
      })
      if (!question) {
        return next(ApiError.forbidden('Вопрос не найден или доступ запрещен'))
      }
      await AnswerOption.destroy({ where: { id_question: questionId } })
      await AnswerWrite.destroy({ where: { id_question: questionId } })
      await MatchPairs.destroy({ where: { id_question: questionId } })
      await TestQuestion.destroy({ where: { id_question: questionId } })
      await question.destroy()
      res.json({ message: 'Вопрос успешно удален' })
    } catch (e) {
      console.error('Error in deleteQuestion:', e)
      return next(ApiError.internal('Ошибка при удалении вопроса'))
    }
  }

  //тест
  async getMyTests(req, res, next) {
    try {
      const teacherId = req.user.id
      const tests = await Test.findAll({
        where: { createdBy: teacherId },
        include: [
          {
            model: Question,
            through: { attributes: [] }
          }
        ],
        order: [['createdAt', 'DESC']]
      })

      res.json(tests)
    } catch (e) {
      console.error('Error in getMyTests:', e)
      return next(ApiError.internal('Ошибка при получении тестов'))
    }
  }

  async getCourseTests(req, res, next) {
    try {
      const { courseId } = req.params
      const teacherId = req.user.id

      const course = await Course.findOne({
        where: { id: courseId, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Доступ запрещен'))
      }

      const courseTests = await CourseTest.findAll({
        where: { id_course: courseId }
      });
      const testIds = courseTests.map(ct => ct.id_test)
      const tests = await Test.findAll({
        where: { id: testIds },
        attributes: ['id', 'title', 'description', 'timeLimit', 'createdAt']
      })

      const result = courseTests.map(courseTest => {
        const test = tests.find(t => t.id === courseTest.id_test)
        return {
          ...courseTest.toJSON(),
          Test: test
        }
      })

      res.json(result)

    } catch (e) {
      console.error('Error in getCourseTests:', e)
      return next(ApiError.internal('Ошибка при получении тестов'))
    }
  }

  async createTest(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { title, description, timeLimit, questionIds } = req.body
      if (!title) {
        return next(ApiError.badRequest('Название теста обязательно'))
      }
      if (questionIds && questionIds.length > 0) {
        const questions = await Question.findAll({
          where: {
            id: questionIds
          }
        })
        if (questions.length !== questionIds.length) {
          return next(ApiError.badRequest('Некоторые вопросы не найдены'))
        }
      }
      const test = await Test.create({
        title,
        description: description || null,
        timeLimit: timeLimit || null,
        isGenerated: false,
        createdBy: teacherId
      })

      if (questionIds && questionIds.length > 0) {
        const testQuestionRecords = questionIds.map(questionId => ({
          id_test: test.id,
          id_question: questionId
        }))
        await TestQuestion.bulkCreate(testQuestionRecords)
      }

      const testWithQuestions = await Test.findByPk(test.id, {
        include: [
          {
            model: Question,
            through: { attributes: [] },
            include: [
              { model: AnswerOption, as: 'answerOptions' },
              { model: MatchPairs, as: 'matchPairs' },
              { model: AnswerWrite, as: 'correctWrite' }
            ]
          }
        ]
      })

      res.json(testWithQuestions)
    } catch (e) {
      console.error('Error in createTest:', e)
      return next(ApiError.internal('Ошибка при создании теста'))
    }
  }

  async updateTest(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id
      const { title, description, timeLimit } = req.body

      const test = await Test.findOne({
        where: { id, createdBy: teacherId }
      })

      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }

      await test.update({
        title: title || test.title,
        description: description !== undefined ? description : test.description,
        timeLimit: timeLimit !== undefined ? timeLimit : test.timeLimit
      })

      res.json(test)
    } catch (e) {
      console.error('Error in updateTest:', e)
      return next(ApiError.internal('Ошибка при обновлении теста'))
    }
  }

  async deleteTest(req, res, next) {
    try {
      const testId = req.params.id
      const teacherId = req.user.id

      const test = await Test.findOne({
        where: {
          id: testId,
          createdBy: teacherId
        }
      })

      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }

      await CourseTest.destroy({ where: { id_test: testId } })
      await TestQuestion.destroy({ where: { id_test: testId } })
      await TestAttempt.destroy({ where: { id_test: testId } })

      await test.destroy()
      res.json({ message: 'Тест успешно удален' })

    } catch (e) {
      console.error('Error in deleteTest:', e)
      return next(ApiError.internal('Ошибка при удалении теста'))
    }
  }

  async getTestById(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id

      const test = await Test.findOne({
        where: {
          id: id,
          createdBy: teacherId
        },
        include: [
          {
            model: Question,
            through: { attributes: [] },
            include: [
              { model: AnswerOption, as: 'answerOptions' },
              { model: AnswerWrite, as: 'correctWrite' },
              { model: MatchPairs, as: 'matchPairs' }
            ]
          }
        ]
      })

      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }

      res.json(test)

    } catch (e) {
      console.error('Error in getTestDetails:', e)
      return next(ApiError.internal('Ошибка при получении информации о тесте'))
    }
  }

  async getTestQuestions(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id

      const test = await Test.findOne({
        where: {
          id,
          createdBy: teacherId
        }
      })

      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }

      const questions = await Question.findAll({
        include: [
          {
            model: Test,
            where: { id },
            through: { attributes: [] },
            attributes: []
          },
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
      })

      res.json(questions)
    } catch (e) {
      console.error('Error in getTestQuestions:', e)
      return next(ApiError.internal('Ошибка при получении вопросов теста'))
    }
  }

  async addQuestionsToTest(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id
      const { questionIds } = req.body
      if (!questionIds || questionIds.length === 0) {
        return next(ApiError.badRequest('Не переданы вопросы'))
      }
      const test = await Test.findOne({
        where: { id, createdBy: teacherId }
      })
      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }
      const questions = await Question.findAll({
        where: {
          id: questionIds
        }
      })

      if (questions.length === 0) {
        return next(ApiError.badRequest('Вопросы не найдены'))
      }
      const existingTestQuestions = await TestQuestion.findAll({
        where: { id_test: id }
      })

      const existingQuestionIds = existingTestQuestions.map(tq => tq.id_question)
      const newQuestionIds = questionIds.filter(qId => !existingQuestionIds.includes(qId))

      if (newQuestionIds.length === 0) {
        return next(ApiError.badRequest('Все вопросы уже добавлены в тест'))
      }

      const testQuestionRecords = newQuestionIds.map(questionId => ({
        id_test: id,
        id_question: questionId
      }))
      await TestQuestion.bulkCreate(testQuestionRecords)
      res.json({ message: 'Вопросы успешно добавлены', count: newQuestionIds.length })

    } catch (e) {
      console.error('Error in addQuestionsToTest:', e)
      return next(ApiError.internal('Ошибка при добавлении вопросов к тесту'))
    }
  }

  async removeQuestionsFromTest(req, res, next) {
    try {
      const { id } = req.params
      const teacherId = req.user.id
      const { questionIds } = req.body

      if (!questionIds || questionIds.length === 0) {
        return next(ApiError.badRequest('Не переданы вопросы для удаления'))
      }

      const test = await Test.findOne({
        where: { id, createdBy: teacherId }
      });

      if (!test) {
        return next(ApiError.forbidden('Тест не найден или доступ запрещен'))
      }

      await TestQuestion.destroy({
        where: {
          id_test: id,
          id_question: questionIds
        }
      })

      res.json({ message: 'Вопросы удалены из теста' })
    } catch (e) {
      console.error('Error in removeQuestionsFromTest:', e)
      return next(ApiError.internal('Ошибка при удалении вопросов из теста'))
    }
  }

  async attachTestToCourse(req, res, next) {
    try {
      const { courseId, testId } = req.params
      const { deadline, attemptsAllowed } = req.body

      const courseTest = await CourseTest.create({
        id_course: courseId,
        id_test: testId,
        deadline: deadline ? new Date(deadline) : null,
        attemptsAllowed: attemptsAllowed || 1
      })

      res.json(courseTest);
    } catch (e) {
      console.error('Error in attachTestToCourse:', e)
      if (e.name === 'SequelizeUniqueConstraintError') {
        return next(ApiError.badRequest('Тест уже привязан к этому курсу'))
      }

      if (e.name === 'SequelizeForeignKeyConstraintError') {
        return next(ApiError.badRequest('Курс или тест не найден'))
      }

      return next(ApiError.internal('Ошибка при привязке теста к курсу'))
    }
  }

  async updateCourseTest(req, res, next) {
    try {
      const { courseId, testId } = req.params
      const teacherId = req.user.id
      const { deadline, attemptsAllowed } = req.body

      const course = await Course.findOne({
        where: { id: courseId, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'))
      }

      const courseTest = await CourseTest.findOne({
        where: { id_course: courseId, id_test: testId }
      })

      if (!courseTest) {
        return next(ApiError.badRequest('Тест не привязан к этому курсу'))
      }

      await courseTest.update({
        deadline: deadline ? new Date(deadline) : null,
        attemptsAllowed: attemptsAllowed || 1
      })

      res.json(courseTest)
    } catch (e) {
      console.error('Error in updateCourseTest:', e)
      return next(ApiError.internal('Ошибка при обновлении параметров теста'))
    }
  }

  async detachTestFromCourse(req, res, next) {
    try {
      const { courseId, testId } = req.params
      const teacherId = req.user.id

      const course = await Course.findOne({
        where: { id: courseId, id_teacher: teacherId }
      })

      if (!course) {
        return next(ApiError.forbidden('Курс не найден или доступ запрещен'))
      }

      const result = await CourseTest.destroy({
        where: { id_course: courseId, id_test: testId }
      })

      if (result === 0) {
        return next(ApiError.badRequest('Тест не был привязан к этому курсу'))
      }

      res.json({ message: 'Тест успешно отвязан от курса' })
    } catch (e) {
      console.error('Error in detachTestFromCourse:', e)
      return next(ApiError.internal('Ошибка при отвязке теста от курса'))
    }
  }

  //статистика 
  async getStudentStatistics(req, res, next) {
    try {
      const { testId } = req.params;
      const teacherId = req.user.id;

      console.log(`Получение статистики для теста ${testId} учителем ${teacherId}`);

      // Проверяем существование теста и права доступа
      const test = await Test.findOne({
        where: {
          id: testId,
          createdBy: teacherId
        }
      });

      if (!test) {
        console.log(`Тест ${testId} не найден или нет доступа`);
        return next(ApiError.forbidden('Доступ к статистике запрещен'));
      }

      // Получаем все попытки с включением данных студента
      const attempts = await TestAttempt.findAll({
        where: { id_test: testId },
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surname', 'email'],
          required: false, // LEFT JOIN вместо INNER JOIN
          include: [{
            model: Group,
            as: 'groups',
            through: { attributes: [] },
            attributes: ['id', 'name'],
            required: false
          }]
        }],
        order: [['score', 'DESC']]
      });

      console.log(`Найдено ${attempts.length} попыток`);

      const studentLastAttempts = {};

      attempts.forEach(attempt => {
        try {
          // Проверяем, что студент существует
          if (!attempt.student) {
            console.warn(`Пропущена попытка ID ${attempt.id}: студент не найден`);
            return;
          }

          const studentId = attempt.student.id;

          // Безопасное получение данных студента
          const studentName = attempt.student.name || '';
          const studentSurname = attempt.student.surname || '';
          const studentEmail = attempt.student.email || '';

          // Безопасное получение группы
          let groupName = 'Не в группе';
          if (attempt.student.groups && attempt.student.groups.length > 0 && attempt.student.groups[0]) {
            groupName = attempt.student.groups[0].name || 'Не в группе';
          }

          if (!studentLastAttempts[studentId] ||
            attempt.attemptNumber > studentLastAttempts[studentId].attemptNumber) {
            studentLastAttempts[studentId] = {
              student: {
                id: studentId,
                name: `${studentSurname} ${studentName}`.trim(),
                email: studentEmail,
                group: groupName
              },
              score: attempt.score || 0,
              grade: attempt.grade || 2,
              timeSpent: attempt.timeSpent || 0,
              isCompleted: attempt.isCompleted || false,
              attemptNumber: attempt.attemptNumber || 1,
              testEnd: attempt.testEnd
            };
          }
        } catch (error) {
          console.error(`Ошибка при обработке попытки ${attempt.id}:`, error);
        }
      });

      const statistics = Object.values(studentLastAttempts);
      console.log(`Сформировано статистики для ${statistics.length} студентов`);

      res.json(statistics);

    } catch (e) {
      console.error('Error in getStudentStatistics:', e);
      return next(ApiError.internal('Ошибка при получении статистики'));
    }
  }

  async filterStudentStatistics(req, res, next) {
    try {
      const { testId } = req.params
      const teacherId = req.user.id
      const { sortBy, sortOrder, groupName } = req.query

      const test = await Test.findOne({
        where: {
          id: testId,
          createdBy: teacherId
        }
      })

      if (!test) {
        return next(ApiError.forbidden('Доступ к статистике запрещен'))
      }

      let whereClause = { id_test: testId }
      let order = []

      if (groupName) {
        whereClause['$student.groups.name$'] = groupName
      }

      if (sortBy) {
        order.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC'])
      } else {
        order.push(['score', 'DESC'])
      }

      const attempts = await TestAttempt.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [{
            model: Group,
            as: 'groups',
            through: { attributes: [] },
            attributes: ['id', 'name']
          }]
        }],
        order: order
      })

      const studentLastAttempts = {}

      attempts.forEach(attempt => {
        const studentId = attempt.student.id

        if (!studentLastAttempts[studentId] ||
          attempt.attemptNumber > studentLastAttempts[studentId].attemptNumber) {
          studentLastAttempts[studentId] = {
            student: {
              id: attempt.student.id,
              name: `${attempt.student.surname} ${attempt.student.name}`,
              email: attempt.student.email,
              group: attempt.student.groups && attempt.student.groups[0] ?
                attempt.student.groups[0].name : 'Не в группе'
            },
            score: attempt.score,
            grade: attempt.grade || 2,
            timeSpent: attempt.timeSpent,
            isCompleted: attempt.isCompleted,
            attemptNumber: attempt.attemptNumber,
            testEnd: attempt.testEnd
          }
        }
      })
      const statistics = Object.values(studentLastAttempts)
      res.json(statistics)

    } catch (e) {
      console.error('Error in filterStudentStatistics:', e)
      return next(ApiError.internal('Ошибка при фильтрации статистики'))
    }
  }

  async getGroupStatistics(req, res, next) {
    try {
      const { courseId } = req.params
      const teacherId = req.user.id

      const course = await Course.findOne({
        where: {
          id: courseId,
          id_teacher: teacherId
        }
      })

      if (!course) {
        return next(ApiError.forbidden('Доступ запрещен'))
      }

      const courseTests = await CourseTest.findAll({
        where: { id_course: courseId },
        attributes: ['id_test']
      })

      if (courseTests.length === 0) {
        return res.json([])
      }

      const testIds = courseTests.map(ct => ct.id_test)
      const attempts = await TestAttempt.findAll({
        where: {
          id_test: testIds
        },
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surname', 'email'],
          required: false, // Добавьте это
          include: [{
            model: Group,
            as: 'groups',
            through: { attributes: [] },
            attributes: ['id', 'name'],
            required: false // Добавьте это
          }]
        }]
      })

      const lastAttempts = {}
      attempts.forEach(attempt => {
        // Добавьте проверку на null
        if (!attempt.student) {
          console.warn(`Пропущена попытка ${attempt.id}: студент не найден`);
          return;
        }

        const studentId = attempt.student.id
        const attemptKey = `${studentId}_${attempt.id_test}`

        if (!lastAttempts[attemptKey] || attempt.attemptNumber > lastAttempts[attemptKey].attemptNumber) {
          lastAttempts[attemptKey] = attempt
        }
      });

      const lastAttemptsArray = Object.values(lastAttempts)
      const groupStats = {}

      lastAttemptsArray.forEach(attempt => {
        // Добавьте проверки на группы
        if (attempt.student.groups && attempt.student.groups.length > 0 && attempt.student.groups[0]) {
          const groupId = attempt.student.groups[0].id
          const groupName = attempt.student.groups[0].name

          if (!groupStats[groupId]) {
            groupStats[groupId] = {
              groupId,
              groupName,
              totalStudents: new Set(),
              completedTests: 0,
              totalScore: 0,
              totalTime: 0,
              grades: []
            }
          }

          groupStats[groupId].totalStudents.add(attempt.student.id)

          if (attempt.isCompleted) {
            groupStats[groupId].completedTests++;
            groupStats[groupId].totalScore += attempt.score || 0;
            groupStats[groupId].totalTime += attempt.timeSpent || 0;
            groupStats[groupId].grades.push(attempt.grade || 2);
          }
        }
      })

      const result = Object.values(groupStats).map(group => {
        const avgScore = group.completedTests > 0 ?
          parseFloat((group.totalScore / group.completedTests).toFixed(1)) : 0
        const avgTime = group.completedTests > 0 ?
          parseFloat((group.totalTime / group.completedTests).toFixed(1)) : 0
        const avgGrade = group.grades.length > 0 ?
          parseFloat((group.grades.reduce((a, b) => a + b, 0) / group.grades.length).toFixed(1)) : 0

        return {
          groupId: group.groupId,
          groupName: group.groupName,
          totalStudents: group.totalStudents.size,
          completedTests: group.completedTests,
          averageScore: avgScore,
          averageTime: avgTime,
          averageGrade: avgGrade
        }
      })

      console.log(`Сформировано статистики для ${result.length} групп`);
      res.json(result)

    } catch (e) {
      console.error('Error in getGroupStatistics:', e)
      return next(ApiError.internal('Ошибка при получении статистики групп'))
    }
  }
  async filterGroupStatistics(req, res, next) {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.id;
      const { sortBy = 'averageGrade', sortOrder = 'desc' } = req.query;

      console.log(`Фильтрация статистики групп для курса ${courseId}`, { sortBy, sortOrder });

      // Проверяем доступ к курсу
      const course = await Course.findOne({
        where: {
          id: courseId,
          id_teacher: teacherId
        }
      });

      if (!course) {
        return next(ApiError.forbidden('Доступ запрещен'));
      }

      // Получаем ID тестов курса
      const courseTests = await CourseTest.findAll({
        where: { id_course: courseId },
        attributes: ['id_test']
      });

      if (courseTests.length === 0) {
        console.log('Для курса не найдено тестов');
        return res.json([]);
      }

      const testIds = courseTests.map(ct => ct.id_test);

      // Получаем все попытки для тестов курса
      const attempts = await TestAttempt.findAll({
        where: {
          id_test: testIds
        },
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surname', 'email'],
          required: false,
          include: [{
            model: Group,
            as: 'groups',
            through: { attributes: [] },
            attributes: ['id', 'name'],
            required: false
          }]
        }]
      });

      console.log(`Найдено ${attempts.length} попыток`);

      // Находим последние попытки для каждого студента и теста
      const lastAttempts = {};
      attempts.forEach(attempt => {
        // Пропускаем попытки без студента
        if (!attempt.student) {
          return;
        }

        const studentId = attempt.student.id;
        const attemptKey = `${studentId}_${attempt.id_test}`;

        if (!lastAttempts[attemptKey] ||
          attempt.attemptNumber > lastAttempts[attemptKey].attemptNumber) {
          lastAttempts[attemptKey] = attempt;
        }
      });

      const lastAttemptsArray = Object.values(lastAttempts);
      const groupStats = {};

      // Собираем статистику по группам
      lastAttemptsArray.forEach(attempt => {
        // Проверяем наличие студента и групп
        if (!attempt.student || !attempt.student.groups || attempt.student.groups.length === 0) {
          return;
        }

        const group = attempt.student.groups[0];
        if (!group) {
          return;
        }

        const groupId = group.id;
        const groupName = group.name;

        if (!groupStats[groupId]) {
          groupStats[groupId] = {
            groupId,
            groupName,
            totalStudents: new Set(),
            completedTests: 0,
            totalScore: 0,
            totalTime: 0,
            grades: []
          };
        }

        // Добавляем студента в группу
        groupStats[groupId].totalStudents.add(attempt.student.id);

        // Учитываем только завершенные попытки для статистики
        if (attempt.isCompleted) {
          groupStats[groupId].completedTests++;
          groupStats[groupId].totalScore += attempt.score || 0;
          groupStats[groupId].totalTime += attempt.timeSpent || 0;
          groupStats[groupId].grades.push(attempt.grade || 2);
        }
      });

      // Формируем результат
      let result = Object.values(groupStats).map(group => {
        const avgScore = group.completedTests > 0 ?
          parseFloat((group.totalScore / group.completedTests).toFixed(1)) : 0;
        const avgTime = group.completedTests > 0 ?
          parseFloat((group.totalTime / group.completedTests).toFixed(1)) : 0;
        const avgGrade = group.grades.length > 0 ?
          parseFloat((group.grades.reduce((a, b) => a + b, 0) / group.grades.length).toFixed(1)) : 0;

        return {
          groupId: group.groupId,
          groupName: group.groupName,
          totalStudents: group.totalStudents.size,
          completedTests: group.completedTests,
          averageScore: avgScore,
          averageTime: avgTime,
          averageGrade: avgGrade
        };
      });

      // Применяем сортировку
      if (sortBy) {
        result.sort((a, b) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];

          // Для строкового сравнения (название группы)
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
          if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }

      console.log(`Сформировано ${result.length} групп после фильтрации`);
      res.json(result);

    } catch (e) {
      console.error('Error in filterGroupStatistics:', e);
      return next(ApiError.internal('Ошибка при фильтрации статистики групп'));
    }
  }
}
module.exports = new TeacherController()