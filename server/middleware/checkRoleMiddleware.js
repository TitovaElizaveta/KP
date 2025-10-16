const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      return next()
    }
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return next(ApiError.unauthorized('Не авторизован'))
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      if (decoded.role!== role) {
        return next(ApiError.forbidden('Нет доступа'))
      }
      req.user = decoded
      next()
    } catch (e){
      if (e instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized('Токен истек'))
      }
      if (e instanceof jwt.JsonWebTokenError) {
        return next(ApiError.unauthorized('Неверный токен'))
      }
      return next(ApiError.internal('Ошибка сервера'))
    }
  }
}