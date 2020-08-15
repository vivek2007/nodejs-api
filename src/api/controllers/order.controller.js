const User = require('../models/user.model')
const Order = require('../models/order.model')
const Membershiplevel = require('../models/membershiplevel.model')
const Professionalfeature = require('../models/professionalfeature.model')
const Professionalfeatureorder = require('../models/professionalfeatureorder.model')
const Cartitem = require('../models/cartitem.model')
const pay = require('./authorize')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET
const jwtExpirationInterval = process.env.JWT_EXPIRATION_DAYS
const {orderConfirmation, orderconfirmation} = require('../utils/mailer')
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
		let user = await User.findOne({$or:[{email:email},{username:email}]}).exec()
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
					orderconfirmation(req.get('host'),_id,user.email)
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
		let { userID, min, max, sortBy, month, year } = req.body
		sortBy = (sortBy != undefined)?sortBy:""
		month = (month != undefined)?month:0
		year = (year != undefined)?year:0
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let orderDetails = []
			let orders = await Order.find({userID:userID}).exec()
			const totalOrders = orders.length
			if(orders)
			{
				if(month && year)
				{
					let fromDate = new Date(`${year}-${month}-01`)
					let toDate = new Date(`${year}-${month}-31`)
					orders = await Order.find({userID:userID,launchDate:{$gte:fromDate,$lte:toDate}},{websites:1,invoiceID:1,paymentStatus:1,createdAt:1,userID:1,totalClicks:1,additionalClicks:1,launchDate:1,cardNumber:1,cardType:1,amount:1}).sort({launchDate:1}).skip(min).limit(max).exec()
				}
				else
				{
					orders = await Order.find({userID:userID},{websites:1,invoiceID:1,paymentStatus:1,createdAt:1,userID:1,totalClicks:1,additionalClicks:1,launchDate:1,cardNumber:1,cardType:1,amount:1}).sort({_id:-1}).skip(min).limit(max).exec()
				}
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
					membershipLevel.clicksLeft = (membershipLevel.clicksLeft < 0)?0:membershipLevel.clicksLeft
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

exports.getProfessionalFeatures = async (req,res) => {
	try
	{
		let { userID } = req.body
		let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
		if(user)
		{
			let professionalFeatures = []
			let features = await Professionalfeature.find({},{ name:1,amount:1,description:1 }).exec()
			let totalFeatures = features.length
			if(totalFeatures)
			{
				for(let i=0;i<totalFeatures;i++)
				{
					let feature = JSON.parse(JSON.stringify(features[i]))
					let userCart = await Cartitem.findOne({userID:userID,featureID:feature._id,orderID:""}).exec()
					feature.itemAddedToCart = false
					if(userCart)
					{
						feature.itemAddedToCart = true
					}
					professionalFeatures.push(feature)
					if(i == (totalFeatures - 1))
					{
						return res.status(200).json({
							status: 1,
							message: `Features found`,
							professionalFeatures
						})
					}
				}
			}
			else
			{
				return res.status(200).json({
					status: 0,
					message: `No features found`
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

exports.addToCart = async (req,res) => {
	try
	{
		let { userID, featureID } = req.body
		let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
		if(user)
		{
			let professionalFeatures = []
			let feature = await Professionalfeature.findOne({_id:featureID},{ amount:1 }).exec()
			if(feature)
			{
				let userCart = await Cartitem.findOne({userID:userID,featureID:featureID,orderID:""}).exec()
				if(!userCart)
				{
					let cartItem = {
						userID,
						featureID,
						amount:feature.amount
					}
					Cartitem.create(cartItem).then(async cart => {
						return res.status(200).json({
							status: 1,
							message: `Item added to cart`,
							cart
						})
					})
				}
				else
				{
					return res.status(200).json({
						status: 0,
						message: `Item already added to cart`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Feature not found`
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

exports.removeFromCart = async (req,res) => {
	try
	{
		let { userID, featureID } = req.body
		let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
		if(user)
		{
			let professionalFeatures = []
			let feature = await Professionalfeature.findOne({_id:featureID},{ amount:1 }).exec()
			if(feature)
			{
				await Cartitem.deleteOne({userID:userID,featureID:featureID,orderID:""}).exec()
				return res.status(200).json({
					status: 1,
					message: `Item removed from cart`
				})
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Feature not found`
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

exports.orderProfessionalFeature = async (req,res) => {
	try
	{
		let { userID, cardNumber, cardType, expiry, cvv } = req.body
		let user = await User.findOne({_id:userID},{ totalClicksPurchased:1 }).exec()
		if(user)
		{
			let cartItems = await Cartitem.find({userID:userID,orderID:""},{ amount:1}).exec()
			let totalItems = cartItems.length
			if(totalItems)
			{
				req.body.orderAmount = 0
				for(let i=0;i<totalItems;i++)
				{
					req.body.orderAmount += cartItems[i].amount
				}
				Professionalfeatureorder.create(req.body).then(async order => {
					await Cartitem.updateMany({userID:userID,orderID:""},{$set:{orderID:order._id}}).exec()
					order = JSON.parse(JSON.stringify(order))
					order.cartItems = await Cartitem.find({userID:userID,orderID:order._id},{ userID:1, featureID:1, amount:1}).exec()
					return res.status(200).json({
						status: 1,
						message: `Order placed successfully.`,
						order
					})
				})
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Your cart is empty. Please add items to cart and continue.`
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

exports.updateProfessionalOrderPaymentStatus = async (req,res) => {
	try
	{
		let { userID, orderID, transactionID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let order = await Professionalfeatureorder.findOne({_id:orderID},{ userID:1 }).exec()
			if(order)
			{
				if(order.userID == userID)
				{
					await Professionalfeatureorder.updateOne({_id:orderID},{$set:{ paymentStatus:1, transactionID:transactionID, updatedAt:new Date() }})
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
