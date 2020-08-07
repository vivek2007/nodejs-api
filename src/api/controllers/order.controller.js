const User = require('../models/user.model')
const Order = require('../models/order.model')
const Membershiplevel = require('../models/membershiplevel.model')
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
		let { totalClicks, userID, launchDate, websites, cardNumber, cardType, expiry, cvv, amount } = req.body
		if(!amount)
		{
			req.body.amount = 100
		}
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			Order.create(req.body).then(async order => {
				/*pay.chargeCreditCard(async response => {
					return res.status(200).json({
						status: 1,
						message: `Order saved succesfully`,
						orderDetails:response
					})
				})*/
				return res.status(200).json({
					status: 1,
					message: `Order saved succesfully`,
					orderDetails:order
				})
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

exports.getOrders = async (req, res) => {
	try 
	{
		let { userID, min, max } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let orderDetails = []
			let orders = await Order.find({userID:userID}).exec()
			const totalOrders = orders.length
			if(orders)
			{
				orders = await Order.find({userID:userID},{websites:1,invoiceID:1,paymentStatus:1,createdAt:1,userID:1,totalClicks:1,launchDate:1,cardNumber:1,cardType:1,amount:1}).sort({_id:-1}).skip(min).limit(max).exec()
				let ordersLength = orders.length
				if(ordersLength == 0)
				{
					return res.status(200).json({
						status: 0,
						message: `No orders yet`,
						totalOrders,
						orderDetails,
					})
				}
				else
				{
					for(let i=0;i<ordersLength;i++)
					{
						orders[i].cardNumber = orders[i].cardNumber.replace(/\d(?=\d{4})/g, "*")
						orderDetails.push(orders[i])
						if(i == (ordersLength - 1))
						{
							return res.status(200).json({
								status: 1,
								message: `Orders found succcessfully`,
								totalOrders,
								orderDetails,
							})
						}
					}
				}
			}
			else
			{
				return res.status(200).json({
					status: 0,
					message: `No orders yet`,
					totalOrders:0,
					orderDetails,
				})
			}
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

exports.getMembershipLevels = async (req,res) => {
	try
	{
		let membershipLevels = await Membershiplevel.find({},{ level:1,clicks:1,description:1 }).exec()
		return res.status(200).json({
			status: 1,
			message: `Details found`,
			membershipLevels
		})
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

exports.updatePaymentStatus = async (req,res) => {
	try
	{
		let { userID, orderID, transactionID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let order = await Order.findOne({_id:orderID},{ userID:1 }).exec()
			if(order)
			{
				if(order.userID == userID)
				{
					await Order.updateOne({_id:orderID},{$set:{ paymentStatus:1, transactionID:transactionID, updatedAt:new Date() }})
					return res.status(200).json({
						status: 1,
						message: `Payment status updated successfully`
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access!! You cannot update order payment details of some other user`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Order not found`
				})
			}
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
