const User = require('../models/user.model')
const Order = require('../models/order.model')
const pay = require('./authorize')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET
const jwtExpirationInterval = process.env.JWT_EXPIRATION_DAYS

let isValidUser = async (userID) => {
	try
	{
		return new Promise(async resolve => {
			let user = await User.findOne({_id:userID},{email:1}).exec()
			if(user)
			{
				return resolve(1)
			}
			else
			{
				return resolve(0)
			}
		})
	}
	catch (error) 
	{
		console.log(`In catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}	

exports.order = async (req, res) => {
	try 
	{
		let { totalClicks, userID, launchDate, websites, cardNumber, cardType, expiry, cvv } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			Order.create(req.body).then(async order => {
				pay.chargeCreditCard(async response => {
					return res.status(200).json({
						status: 1,
						message: `Order saved succesfully`,
						orderDetails:response
					})
				})
				/*return res.status(200).json({
					status: 1,
					message: `Order saved succesfully`,
					orderDetails:order
				})*/
			})
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	} 
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}
