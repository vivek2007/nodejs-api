const express=require('express')
const nodemailer = require("nodemailer")
const path = require('path')
const Hogan = require('hogan.js')
const fs = require('fs')
const app = express()
require('dotenv').config()

const verifyEmail =  fs.readFileSync('./src/api/views/verifyEmail.hjs',{encoding:'utf8', flag:'r'}); 
const VerifyEmail = Hogan.compile(verifyEmail)

const referalCode =  fs.readFileSync('./src/api/views/referalcode.hjs',{encoding:'utf8', flag:'r'}); 
const referalcodeEmail = Hogan.compile(referalCode)

const resetpassword =  fs.readFileSync('./src/api/views/resetpassword.hjs',{encoding:'utf8', flag:'r'}); 
const resetpasswordEmail = Hogan.compile(resetpassword)

const smtpTransport = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
})

module.exports.sendReferralCode = async (host,email,username,referralCode) => {
	console.log(`in sendReferralCode\nhost ${host},email ${email},username ${username},referralCode ${referralCode}`)
	let mailOptions={
        to : email,
        subject : `Email Verified Success`,
		html : referalcodeEmail.render({name = `${username}`, code = `${referralCode}` })
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(`Error in sending mail. Error: ${error}`)
		}else{
			console.log(`Mail sent: ${JSON.stringify(response)}`)
		}
	})
}

module.exports.sendVerificationEmail = async (host,email,username,token) => {
	console.log(`in sendVerificationEmail\nhost ${host},email ${email},username ${username},token ${token}`)
	let link = `http://${process.env.UI_HOST}:${process.env.UI_PORT}/#/auth/verify/${token}`
	let mailOptions={
        to : email,
        subject : `Verify Email`,
		html : 	VerifyEmail.render({link :`${link}`})
		// `Dear ${username},<br> Please click <a href="${link}">here</a> to verify your email.`
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(`Error in sending mail. Error: ${error}`)
		}else{
			console.log(`Mail sent: ${JSON.stringify(response)}`)
		}
	})
}

module.exports.sendResetPassword = async (host,email,username,token) => {
	console.log(`in sendResetPassword\nhost ${host},email ${email},username ${username},token ${token}`)
	let link = `http://${process.env.UI_HOST}:${process.env.UI_PORT}/#/auth/change-password/${token}`
	let mailOptions={
        to : email,
        subject : `Reset Password`,
        html : resetpasswordEmail.render({link :`${link}`})
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(`Error in sending mail. Error: ${error}`)
		}else{
			console.log(`Mail sent: ${JSON.stringify(response)}`)
		}
	})
}
