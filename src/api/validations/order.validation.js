const Joi = require('joi');

module.exports = {
  // POST /v1/user/order
  order: {
    body: Joi.object({
      userID: Joi.string().email().required(),
      launchDate: Joi.string(),
      totalClicks: Joi.string().required(),
      websites: Joi.array().items(Joi.object().keys())
    }),
  }
}
