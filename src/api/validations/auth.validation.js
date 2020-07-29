const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: Joi.object({
      email: Joi.string().email().required(),
      username: Joi.string().regex(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/).min(3).max(30).required().messages({
		  "string.regex": "Username must not contain any spaces"
		}),
      password: Joi.string().required().min(6).max(128),
      referredByCode: Joi.string().optional().allow('')
    }),
  },
  // POST /v1/auth/forgot-password
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().required()
    })
  },
  // POST /v1/auth/resend-email-verification
  resendEmailVerification: {
    body: Joi.object({
      email: Joi.string().email().required()
    })
  },
  // POST /v1/auth/change-password
  changePassword: {
    body: Joi.object({
		id:Joi.string().required(),
      password: Joi.string().required().min(6).max(128)
    })
  },
  // POST /v1/auth/login
  login: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required().max(128),
    }),
  },
  // GET /v1/auth/verify
  verify: {
    params: Joi.object({
      id: Joi.string().required()
    })
  }
}
