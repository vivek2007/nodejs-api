const User = require('../models/user.model')
const { sendVerificationEmail, sendResetPassword, sendReferralCode } = require('../utils/mailer')
const moment = require('moment-timezone')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET
const jwtExpirationInterval = process.env.JWT_EXPIRATION_DAYS

let generateToken = (user) => {
	const playload = {
		exp: moment().add(jwtExpirationInterval, 'days').unix(),
		iat: moment().unix(),
		user: user,
	}
	return jwt.sign(playload, jwtSecret)
}

exports.register = async (req, res) => {
	try 
	{
		let { email, username, password, referredByCode, firstName, lastName } = req.body
		referredByCode = referredByCode == undefined?"":referredByCode.trim()
		let referredByUserID = ""
		let status = 0
		req.body.email = email = email.toLowerCase()
		req.body.username = username = username.toLowerCase()
		let user = await User.findOne({email:email,isDeleted:false},{token:1}).exec()
		if(user)
		{
			return res.status(200).json({
				status,
				message: `Email already registered`,
				user:{}
			})
		}
		else
		{
			user = await User.findOne({username:username,isDeleted:false},{token:1}).exec()
			if(user)
			{
				return res.status(200).json({
					status,
					message: `Username already registered`,
					user:{}
				})
			}
			else
			{
				new Promise(async resolve => {
					if(referredByCode.trim().length)
					{
						user = await User.findOne({referralCode:referredByCode,isDeleted:false,emailVerified:true},{referralCode:1}).exec()
						if(user && user.referralCode)
						{
							resolve({referredByCode:user.referralCode,referredByUserID:user._id})
						}
						else
						{
							return res.status(401).json({
								status:0,
								message: `Invalid referral code. Please use a valid referral code`,
								user:{}
							})
						}
					}
					else
					{
						resolve({referredByCode:"",referredByUserID:""})
					}
				}).then(async referralData => {
					let { referredByCode, referredByUserID } = referralData
					User.create(req.body).then(async user => {
						let uuid = uuidv4()
						sendVerificationEmail(req.get('host'),email,username,uuid)
						password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
						let token = generateToken({email:user.email,username:user.username,userID:user._id})
						let referralCode = Math.random().toString(36).slice(2).toUpperCase()
						await User.updateOne({_id:user._id},{$set:{uuid:uuid,password:password,token:token,referredByCode:referredByCode,referredByUserID:referredByUserID,referralCode:referralCode}}).exec()
						user = await User.findOne({_id:user._id},{token:1,email:1,username:1,firstName:1,lastName:1}).exec()
						return res.status(200).json({
							status:1,
							message: `User registered successfully. A verification link has been sent to your email address. Please verify`,
							user
						})
					})
				}).catch(error => {
					console.log(`In promise catch error: ${error.message}`)
					return res.status(500).json({
						status:0,
						message: `${error.message}`
					})
				})
			}
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

let getUserDetails = async (userID,fields = {email:1,firstName:1,lastName:1,mobileNumber:1,countryCode:1,createdAt:1}) => {
	try
	{
		return new Promise(async resolve => {
			if(userID)
			{
				return resolve(await User.findOne({_id:userID},fields).exec())
			}
			else
			{
				return resolve({})
			}
		})
	}
	catch(error)
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

let getReferrals = async (userID,emailVerified = true,fields = {}) => {
	try
	{
		return new Promise(async resolve => {
			let successReferrals = []
			let users = await User.find({referredByUserID:userID,emailVerified:emailVerified,isDeleted:false},fields).sort({_id:-1}).skip(0).limit(5).exec()
			if(users)
			{
				let totalUsers = users.length
				console.log(`in getSuccessReferrals totalUsers ${totalUsers}`)
				for(let i=0;i<totalUsers;i++)
				{
					await getUserDetails(users[i]._id,fields).then(user => {
						successReferrals.push(user)
					}).catch(error => {
						console.log(`in getSuccessReferrals catch error ${error.message}`)
					})
				}
				return resolve(successReferrals)
			}
			else
			{
				return resolve(successReferrals)
			}
		})
	}
	catch(error)
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

exports.login = async (req, res) => {
	try 
	{
		let { email, password } = req.body
		email = email.toLowerCase()
		let status = 0
		email = email.toLowerCase()
		let user = await User.findOne({$or:[{email:email},{username:email}]}).exec()
		if(user)
		{
			if(user.isDeleted)
			{
				return res.status(404).json({
					status,
					message: `User not exists`,
					user:{}
				})
			}
			if(await bcrypt.compare(password,user.password))
			{
				if(user.emailVerified)
				{
					user.token = generateToken({email:user.email,username:user.username,userID:user._id})
					user.save()
					user = await User.findOne({email:user.email,isDeleted:false},{token:1,email:1,username:1,referralCode:1,firstName:1,lastName:1,referredByUserID:1,mobileNumber:1,countryCode:1}).exec()
					let fields = {email:1,firstName:1,lastName:1,mobileNumber:1,countryCode:1,createdAt:1}
					let referredBy = await getUserDetails(user.referredByUserID,fields)
					let successReferrals = await getReferrals(user._id,true,fields)
					let awaitedReferrals = await getReferrals(user._id,false,fields)
					return res.status(200).json({
						status:1,
						message: `Login success`,
						user,
						referredBy,
						successReferrals,
						awaitedReferrals
					})
				}
				else
				{
					return res.status(400).json({
						status,
						message: `Email not verified. Please verify email`,
						user:{}
					})
				}
			}
			else
			{
				return res.status(200).json({
					status,
					message: `Invalid credentials`,
					user:{}
				})
			}
		}
		else
		{
			return res.status(200).json({
				status,
				message: `Invalid credentials`,
				user:{}
			})
		}
	} 
	catch (error) 
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

exports.verifyEmail = async (req,res) => {
	try
	{
		let token = req.params.id || ""
		if(token.length == 0)
		{
			return res.send(`Invalid credentials`)
		}
		let user = await User.findOne({uuid:token},{email:1,updatedAt:1,isDeleted:1,emailVerified:1,referralCode:1,username:1}).exec()
		if(user)
		{
			if(user.isDeleted)
			{
				return res.send(`User not found`)
			}
			if(user.emailVerified)
			{
				return res.send(`Email already verified. Please login and continue`)
			}
			let currentTime = new Date().getTime()
			let updatedAt = new Date(user.updatedAt).getTime()
			let timeDifference = parseInt((currentTime - updatedAt) / 60000)
			console.log(`timeDifference ${timeDifference}, expire_time ${parseInt(process.env.EMAIL_EXPIRY)}`)
			if(timeDifference <= parseInt(process.env.EMAIL_EXPIRY))
			{
				await User.updateOne({uuid:token},{$set:{emailVerified:true}}).exec()
				sendReferralCode(req.get('host'),user.email,user.username,user.referralCode)
				return res.send(`Email verified success. Please login and continue`)
			}
			else
			{
				return res.send(`Token expired. Unable to verify email. Please login in the app and select resend email for verification`)
			}
		}
		else
		{
			return res.send(`Invalid credentials`)
		}
	}
	catch (error) 
	{
		return res.send(`Internal error. ${error.message}`)
	}
}

exports.forgotPassword = async (req,res) => {
	try
	{
		let { email } = req.body
		let status = 0
		let user = await User.findOne({email:email,isDeleted:false},{username:1,isDeleted:1,emailVerified:1}).exec()
		if(user)
		{
			if(user.emailVerified)
			{
				let uuid = uuidv4()
				await User.updateOne({email:email,isDeleted:false},{$set:{uuid:uuid,updatedAt:new Date()}}).exec()
				sendResetPassword(req.get('host'),email,user.username,uuid)
				return res.status(200).json({
					status:1,
					message: `Reset password link has been sent to your email.`
				})
			}
			else
			{
				return res.status(401).json({
					status,
					message: `You need to verify your email first to request the password.`
				})
			}
		}
		else
		{
			return res.status(200).json({
				status:1,
				message: `Reset password link has been sent to your email and reset your password.`
			})
		}
	}
	catch (error) 
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

exports.changePassword = async (req,res) => {
	try
	{
		let { id, password } = req.body
		let status = 0
		let user = await User.findOne({uuid:id,isDeleted:false,emailVerified:true},{email:1}).exec()
		if(user)
		{
			let uuid = uuidv4()
			password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
			await User.updateOne({_id:user._id},{$set:{password:password,uuid:uuid,updatedAt:new Date()}}).exec()
			return res.status(200).json({
				status:1,
				message: `Password changed successfully`
			})
		}
		else
		{
			return res.status(404).json({
				status,
				message: `User not found`
			})
		}
		
	}
	catch (error) 
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

exports.resendEmailVerification = async (req,res) => {
	try
	{
		let { email } = req.body
		let status = 0
		let user = await User.findOne({email:email,isDeleted:false},{username:1,isDeleted:1,emailVerified:1}).exec()
		if(user)
		{
			if(!user.emailVerified)
			{
				let uuid = uuidv4()
				await User.updateOne({email:email,isDeleted:false},{$set:{uuid:uuid,updatedAt:new Date()}}).exec()
				sendVerificationEmail(req.get('host'),email,user.username,uuid)
				return res.status(200).json({
					status:1,
					message: `A verification link has been sent to your email address. Please verify`
				})
			}
			else
			{
				return res.status(200).json({
					status,
					message: `Email already verified.`
				})
			}
		}
		else
		{
			return res.status(200).json({
				status:1,
				message: `A verification link has been sent to your email address. Please verify`
			})
		}
	}
	catch (error) 
	{
		return res.status(500).json({
			status: 0,
			message: `${error.message}`
		})
	}
}

exports.getUserDetails = getUserDetails
