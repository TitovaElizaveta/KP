const multer = require('multer')
const path = require('path')
const fs = require('fs')
const ApiError = require('../error/ApiError')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(ApiError.badRequest('Разрешены только PDF-файлы'), false)
  }
}
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
})
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('Файл слишком большой. Максимум 10MB'))
        }
        return next(ApiError.badRequest('Ошибка загрузки файла'))
      }
      return next(err)
    }
    if (!req.file) {
      return next(ApiError.badRequest('Файл не был загружен'))
    }
    
    next()
  })
}

module.exports = uploadMiddleware