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
		let { totalClicks, userID, launchDate, websites, cardNumber, cardType, expiry, cvv, amount, transactionID } = req.body
		if(transactionID != "")
		{
			req.body.paymentStatus = 1
		}
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			Order.create(req.body).then(async order => {
				if(transactionID != "")
				{
					let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
					let totalClicksPurchased = user.totalClicksPurchased + totalClicks
					let additionalClicks = 0
					if(totalClicksPurchased >= 1000 && totalClicksPurchased < 2500)
					{
						additionalClicks = parseInt(totalClicks / 5)
					}
					else if(totalClicksPurchased >= 2500 && totalClicksPurchased < 5000)
					{
						additionalClicks = parseInt(totalClicks / 4)
					}
					else if(totalClicksPurchased >= 5000 && totalClicksPurchased < 7500)
					{
						additionalClicks = parseInt(totalClicks / 3)
					}
					else if(totalClicksPurchased >= 7500 && totalClicksPurchased < 10000)
					{
						additionalClicks = parseInt(totalClicks / 2)
					}
					else if(totalClicksPurchased >= 10000)
					{
						additionalClicks = totalClicks
					}
					await User.updateOne({_id:userID},{$inc:{ totalClicksPurchased:totalClicks }}).exec()
					await Order.updateOne({_id:order._id},{$set:{ additionalClicks:additionalClicks }}).exec()
				}
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
				orders = await Order.find({userID:userID},{websites:1,invoiceID:1,paymentStatus:1,createdAt:1,userID:1,totalClicks:1,additionalClicks:1,launchDate:1,cardNumber:1,cardType:1,amount:1}).sort({_id:-1}).skip(min).limit(max).exec()
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
		let { userID } = req.body
		let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
		if(user)
		{
			let totalClicksPurchased = user.totalClicksPurchased
			let membershipLevels = await Membershiplevel.find({},{ level:1,clicks:1,description:1 }).exec()
			let totalLevels = membershipLevels.length
			if(totalLevels)
			{
				let levels = []
				let message = `Currently your account level is none`
				for(let i=0;i<totalLevels;i++)
				{
					let membershipLevel = JSON.parse(JSON.stringify(membershipLevels[i]))
					membershipLevel.clicksLeft = membershipLevel.clicks - totalClicksPurchased
					levels.push(membershipLevel)
					if(totalClicksPurchased >= 1000 && totalClicksPurchased < 2500)
					{
						message = `Currently your account is level-1`
					}
					else if(totalClicksPurchased >= 2500 && totalClicksPurchased < 5000)
					{
						message = `Currently your account is level-2`
					}
					else if(totalClicksPurchased >= 5000 && totalClicksPurchased < 7500)
					{
						message = `Currently your account is level-3`
					}
					else if(totalClicksPurchased >= 7500 && totalClicksPurchased < 10000)
					{
						message = `Currently your account is level-4`
					}
					else if(totalClicksPurchased >= 10000)
					{
						message = `Currently your account is level-5`
					}
					if(i == (totalLevels - 1))
					{
						return res.status(200).json({
							status: 1,
							message,
							totalClicksPurchased,
							membershipLevels:levels
						})
					}
				}
			}
			else
			{
				return res.status(200).json({
					status: 0,
					message: `No details found`,
					totalClicksPurchased:0,
					membershipLevels:[]
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
