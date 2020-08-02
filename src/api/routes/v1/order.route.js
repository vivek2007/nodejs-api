const express = require('express')
const router = express.Router()
const { validate } = require('express-validation')
const controller = require('../../controllers/order.controller')

const { order } = require('../../validations/order.validation')

router.get('/status', (req, res) => res.send('OK'))

router.route('/order')
	.post(validate(order,{},{}), controller.order)

module.exports = router
