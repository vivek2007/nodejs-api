const express = require('express')
const router = express.Router()
const controller = require('../../controllers/order.controller')

router.get('/status', (req, res) => res.send('OK'))

router.route('/order').post(controller.order)
router.route('/get-orders').post(controller.getOrders)
router.route('/get-membership-levels').post(controller.getMembershipLevels)
router.route('/update-payment-status').post(controller.updatePaymentStatus)

module.exports = router
