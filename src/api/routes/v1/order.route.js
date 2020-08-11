const express = require('express')
const router = express.Router()
const controller = require('../../controllers/order.controller')

router.get('/status', (req, res) => res.send('OK'))

router.route('/order').post(controller.order)
router.route('/get-orders').post(controller.getOrders)
router.route('/get-membership-levels').post(controller.getMembershipLevels)
router.route('/update-payment-status').post(controller.updatePaymentStatus)
router.route('/get-professional-features').post(controller.getProfessionalFeatures)
router.route('/add-to-cart').post(controller.addToCart)
router.route('/remove-from-cart').post(controller.removeFromCart)
router.route('/order-professional-feature').post(controller.orderProfessionalFeature)
router.route('/update-professional-order-payment-status').post(controller.updateProfessionalOrderPaymentStatus)

module.exports = router
