const { User, Group, UserGroup } = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const sequelize = require('../db')

class AdminController {
  //преподаватель
  async getAllTeachers(req, res, next) {
    try {
      const teachers = await User.findAll({
        where: { role: 'teacher' },
        attributes: { exclude: ['password'] }
      })
      return res.json(teachers)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при получении списка преподавателей'))
    }
  }

  async createTeacher(req, res, next) {
    try {
      const { email, password, surname, name, last_name } = req.body

      if (!email || !password || !surname || !name) {
        return next(ApiError.badRequest('Не все обязательные поля заполнены'))
      }

      const candidate = await User.findOne({ where: { email } })
      if (candidate) {
        return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }

      const hashPassword = await bcrypt.hash(password, 5)
      const teacher = await User.create({
        email,
        password: hashPassword,
        role: 'teacher',
        surname,
        name,
        last_name: last_name || null
      })
      const teacherResponse = teacher.toJSON()//возрв без пароля
      delete teacherResponse.password
      return res.json(teacherResponse)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при создании преподавателя'))
    }
  }

  async updateTeacher(req, res, next) {
    try {
      const { id } = req.params
      const { email, surname, name, last_name } = req.body

      const teacher = await User.findOne({ 
        where: { id, role: 'teacher' },
        attributes: { exclude: ['password'] }
      })

      if (!teacher) {
        return next(ApiError.badRequest('Преподаватель не найден'))
      }

      if (email && email !== teacher.email) {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
          return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
      }

      await teacher.update({
        email: email || teacher.email,
        surname: surname || teacher.surname,
        name: name || teacher.name,
        last_name: last_name !== undefined ? last_name : teacher.last_name
      })
      return res.json(teacher)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при обновлении преподавателя'))
    }
  }

  async deleteTeacher(req, res, next) {
    try {
      const { id } = req.params
      const teacher = await User.findOne({ where: { id, role: 'teacher' } })
      if (!teacher) {
        return next(ApiError.badRequest('Преподаватель не найден'))
      }
      await teacher.destroy()
      return res.json({ message: 'Преподаватель успешно удален' })

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при удалении преподавателя'))
    }
  }

  //студент
  async getAllStudents(req, res, next) {
    try {
      const students = await User.findAll({
        where: { role: 'student' },
        include: [{
          model: Group,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }],
        attributes: { exclude: ['password'] }
      })

      const formattedStudents = students.map(student => {
        const studentData = student.toJSON()
        return {
          ...studentData,
          group: studentData.Groups?.[0] || null
        }
      })
      return res.json(formattedStudents)

    } catch (e) {
      console.error('Error in getAllStudents:', e)
      return next(ApiError.internal('Ошибка при получении списка студентов'))
    }
  }

  async createStudent(req, res, next) {
    try {
      const { email, password, surname, name, last_name, groupId } = req.body

      if (!email || !password || !surname || !name) {
        return next(ApiError.badRequest('Заполните обязательные поля: email, password, surname, name'))
      }

      const candidate = await User.findOne({ where: { email } })
      if (candidate) {
        return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }

      if (groupId) {
        const groupExists = await Group.findByPk(groupId)
        if (!groupExists) {
          return next(ApiError.badRequest('Указанная группа не существует'))
        }
      }

      const hashPassword = await bcrypt.hash(password, 5)
      const student = await User.create({
        email,
        password: hashPassword,
        surname,
        name,
        last_name: last_name || null,
        role: 'student'
      })

      if (groupId) {
        await UserGroup.create({
          id_student: student.id,
          id_group: groupId
        })
      }

      const studentWithGroup = await User.findByPk(student.id, {
        include: [{
          model: Group,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }],
        attributes: { exclude: ['password'] }
      })

      const studentData = studentWithGroup.toJSON()
      return res.json({
        ...studentData,
        group: studentData.Groups?.[0] || null
      })
    } catch (e) {
      console.error('Error in createStudent:', e)
      return next(ApiError.internal('Ошибка при создании студента'))
    }
  }

  async updateStudent(req, res, next) {
    try {
      const { id } = req.params
      const { email, surname, name, last_name, groupId } = req.body

      const student = await User.findOne({
        where: { id, role: 'student' },
        attributes: { exclude: ['password'] }
      })

      if (!student) {
        return next(ApiError.badRequest('Студент не найден'))
      }

      if (email && email !== student.email) {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
          return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
      }

      if (groupId) {
        const groupExists = await Group.findByPk(groupId)
        if (!groupExists) {
          return next(ApiError.badRequest('Указанная группа не существует'))
        }
      }

      await sequelize.transaction(async (transaction) => {
        await student.update({
          email: email || student.email,
          surname: surname || student.surname,
          name: name || student.name,
          last_name: last_name !== undefined ? last_name : student.last_name
        }, { transaction })

        const currentGroup = await UserGroup.findOne({
          where: { id_student: id },
          transaction
        })

        if (groupId) {
          if (currentGroup) {
            await currentGroup.update({ id_group: groupId }, { transaction })
          } else {
            await UserGroup.create({
              id_student: id,
              id_group: groupId
            }, { transaction })
          }
        } else if (currentGroup) {
          await currentGroup.destroy({ transaction })
        }
      })

      const updatedStudent = await User.findByPk(id, {
        include: [{
          model: Group,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }],
        attributes: { exclude: ['password'] }
      })

      const studentData = updatedStudent.toJSON()
      return res.json({
        ...studentData,
        group: studentData.Groups?.[0] || null
      })
    } catch (e) {
      console.error('Error in updateStudent:', e)
      return next(ApiError.internal('Ошибка при обновлении студента'))
    }
  }

  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params
      const student = await User.findOne({
        where: { id, role: 'student' }
      })

      if (!student) {
        return next(ApiError.badRequest('Студент не найден'))
      }

      await sequelize.transaction(async (transaction) => {
        await UserGroup.destroy({
          where: { id_student: id },
          transaction
        })
        await student.destroy({ transaction })
      })
      return res.json({ message: 'Студент успешно удален' })

    } catch (e) {
      console.error('Error in deleteStudent:', e)
      return next(ApiError.internal('Ошибка при удалении студента'))
    }
  }

  //группа
  async getAllGroups(req, res, next) {
    try {
      const groups = await Group.findAll({
        include: [{
          model: User,
          where: { role: 'student' },
          required: false,
          through: { attributes: [] },
          attributes: { exclude: ['password'] }
        }]
      })

      const formattedGroups = groups.map(group => {
        const groupData = group.toJSON()
        return {
          ...groupData,
          students: groupData.Users || []
        }
      })
      return res.json(formattedGroups)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при получении списка групп'))
    }
  }

  async createGroup(req, res, next) {
    try {
      const { name } = req.body
      const existingGroup = await Group.findOne({ where: { name } })
      if (existingGroup) {
        return next(ApiError.badRequest('Группа с таким названием уже существует'))
      }
      const group = await Group.create({ name })
      return res.json(group)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при создании группы'))
    }
  }

  async updateGroup(req, res, next) {
    try {
      const { id } = req.params
      const { name } = req.body
      const group = await Group.findByPk(id)
      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'))
      }

      if (name && name !== group.name) {
        const existingGroup = await Group.findOne({ where: { name } })
        if (existingGroup) {
          return next(ApiError.badRequest('Группа с таким названием уже существует'))
        }
      }
      await group.update({ name: name || group.name })
      return res.json(group)

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при обновлении группы'))
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params
      const group = await Group.findByPk(id)

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'))
      }

      await sequelize.transaction(async (transaction) => {
        await UserGroup.destroy({
          where: { id_group: id },
          transaction
        })
        await group.destroy({ transaction })
      })
      return res.json({ message: 'Группа успешно удалена' })

    } catch (e) {
      console.error(e)
      return next(ApiError.internal('Ошибка при удалении группы'))
    }
  }
}

module.exports = new AdminController()