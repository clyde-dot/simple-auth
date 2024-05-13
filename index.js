require('dotenv').config({path: './config/.env'})
const PORT = process.env.PORT || 7000

const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlerMiddleware')
const express = require('express')
const app = express()

app.use(express.json())
app.use('/api', router)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

