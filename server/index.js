require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors= require('cors')//запросы с браузера отправлять 
const router =require('./routes/index')
const errorHandler= require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const createFirstAdmin = require('./initialSetup')

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json()) 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api', router)

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    await createFirstAdmin()
    app.listen(PORT, () => console.log(`server start on ${PORT}`))

  } catch (e) {
    console.log(e)
  }
}
start()