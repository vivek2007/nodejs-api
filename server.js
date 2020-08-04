const express = require('express')
const { validate, ValidationError, Joi } = require('express-validation')
const mongoose = require('mongoose')
const promise = require('bluebird')
const cors = require('cors')
require('dotenv').config()
const routes = require('./src/api/routes/v1')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use('/v1', routes)


app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(500).json({
		status:0,
		message: err.details.body[0].message
	})
  }
  return res.status(500).json(err)
})

module.exports = app

// set mongoose Promise to Bluebird
mongoose.Promise = promise

mongoose.connect(process.env.MONGO_URI, {
	useUnifiedTopology: true,
	useCreateIndex: true,
	keepAlive: 1,
	useNewUrlParser:true
}).then(() => console.log(`DB connected`)).catch(err => {
	console.log(`DB Connection Error: ${err.message}`)
	process.exit(-1)
})

const port = parseInt(process.env.PORT)

const server = app.listen(port,function()
{
    console.log(`Server is running at ${port}....`)
})
