const express = require('express')
const router = express.Router()
const controller = require('../../controllers/order.controller')
//const { validate } = require('express-validation')
//const { order } = require('../../validations/order.validation')

router.get('/status', (req, res) => res.send('OK'))

router.route('/order')
	.post(controller.order)

module.exports = router
