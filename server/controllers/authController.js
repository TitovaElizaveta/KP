const { User } = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateJWT = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.SECRET_KEY,
    { expiresIn: '24h' }
  )
}

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return next(ApiError.badRequest('Некорректные данные'))
      }
      
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'))
      }
      
      const comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
        return next(ApiError.badRequest('Указан неверный пароль'))
      }
      
      const token = generateJWT(user.id, user.email, user.role)
      return res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          surname: user.surname,
          name: user.name,
          last_name: user.last_name
        }
      })
    } catch (e) {
      return next(ApiError.internal('Ошибка при авторизации'))
    }
  }

  async check(req, res, next) {
    try {
      const token = generateJWT(req.user.id, req.user.email, req.user.role)
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      })
      
      if (!user) {
        return next(ApiError.unauthorized('Пользователь не найден'))
      }
      
      return res.json({
        token,
        user
      })
    } catch (e) {
      return next(ApiError.internal('Ошибка проверки авторизации'))
    }
  }
}
module.exports = new AuthController()