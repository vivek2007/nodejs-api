const express = require('express')
const router = express.Router()
const { validate } = require('express-validation')
const controller = require('../../controllers/auth.controller')

const { login, register, verify, forgotPassword, changePassword, resendEmailVerification } = require('../../validations/auth.validation')

router.get('/status', (req, res) => res.send('OK'))

router.route('/signup')
	.post(validate(register,{},{}), controller.register)

router.route('/login')
	.post(validate(login), controller.login)

router.route('/forgot-password')
	.post(validate(forgotPassword), controller.forgotPassword)

router.route('/resend-email-verification')
	.post(validate(resendEmailVerification), controller.resendEmailVerification)

router.route('/change-password')
	.post(validate(changePassword), controller.changePassword)
	
router.route('/verify/:id')
	.get(validate(verify), controller.verifyEmail)

module.exports = router
