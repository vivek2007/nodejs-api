const express = require('express')
const router = express.Router()
const auth = require('./auth.route')
const order = require('./order.route')

router.use('/auth', auth)
router.use('/user', order)

module.exports = router
