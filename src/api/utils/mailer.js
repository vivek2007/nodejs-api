const express=require('express')
const nodemailer = require("nodemailer")
const app = express()
require('dotenv').config()

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
        html : `Dear ${username},<br> Thank you for registering with Clicks. Your email has been verified successfully. Please save this referral code <b>${referralCode}</b>. This referral code can be used at the time of signup of your friends and you will get benefits from clicks.`
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
	let link = `http://${process.env.UI_HOST}:{process.env.UI_PORT}/#/auth/verify/${token}`
	let mailOptions={
        to : email,
        subject : `Verify Email`,
        html : `Dear ${username},<br> Please click <a href="${link}">here</a> to verify your email.`
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
        html : `Dear ${username},<br> Please click <a href="${link}">here</a> to reset your password.`
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(`Error in sending mail. Error: ${error}`)
		}else{
			console.log(`Mail sent: ${JSON.stringify(response)}`)
		}
	})
}
