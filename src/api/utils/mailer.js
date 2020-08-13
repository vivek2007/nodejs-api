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
	let link = `http://${process.env.UI_HOST}:${process.env.UI_PORT}/#/auth/verify/${token}`
	let mailOptions={
        to : email,
        subject : `Verify Email`,
		html :`<html>
		<head>
		  <meta charset="UTF-8"/>
		  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
		  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>
		  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
		  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
		  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
		</head>
		<body>
		<div className="row">
		<div className="col-lg-12">
		  <h5 className="mb-4">
			<strong>Verify Email</strong>
		  </h5>
		  <div className="mb-5">
			<div
			  style={{
				background: '#eceff4',
				padding: '50px 20px',
				color: '#514d6a',
				borderRadius: '5px',
			  }}
			>
			  <div style={{ maxWidth: '700px', margin: '0px auto', fontSize: '14px' }}>
				<table
				  cellPadding="0"
				  cellSpacing="0"
				  style={{ width: '100%', marginBottom: '20px', border: '0px' }}
				>
				</table>
				<div style={{ padding: '40px 40px 20px 40px', background: '#fff' }}>
				  <table cellPadding="0" cellSpacing="0" style={{ width: '100%', border: '0px' }}>
					<tbody>
					  <tr>
						<td>
						  <p>Hi there,</p>
						  <p>
							Please Click on the Link  below to Verify Your Account
						  </p>
						  <a href=${link} className="btn btn-primary">Click here to verify</a>
						  </td>
					  </tr>
					</tbody>
				  </table>
				</div>
			 </div>
			</div>
		  </div>
		 </div>
		</div>
		</body>
		</html>`
		
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
        html : `<tbody>
		<tr>
		  <td>
			<p>Hi there,</p>
			<p>
			  Please Click on the Link  below to Reset password of your Account
			</p>
			<a href=${link} className="btn btn-primary">Click here to reset password</a>
			</td>
		</tr>
	  </tbody>`
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(`Error in sending mail. Error: ${error}`)
		}else{
			console.log(`Mail sent: ${JSON.stringify(response)}`)
		}
	})
}
