const express = require('express')
const router = express.Router()
const controller = require('../../controllers/order.controller')
//const { validate } = require('express-validation')
//const { order } = require('../../validations/order.validation')

router.get('/status', (req, res) => res.send('OK'))

router.route('/order').post(controller.order)
router.route('/get-orders').post(controller.getOrders)
router.route('/get-membership-levels').get(controller.getMembershipLevels)
router.route('/update-payment-status').post(controller.updatePaymentStatus)

module.exports = router
