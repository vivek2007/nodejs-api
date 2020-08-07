const express = require('express')
const router = express.Router()
const auth = require('./auth.route')
const order = require('./order.route')
const blog = require('./blog.route')

router.use('/auth', auth)
router.use('/user', order)
router.use('/user/blog', blog)

module.exports = router
