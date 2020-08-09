const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  token : {
  	type: String,
  	default:""
  },
  uuid : {
  	type: String,
  	default:""
  },
  mobileNumber : {
  	type: String,
  	default:""
  },
  countryCode : {
  	type: String,
  	default:""
  },
  firstName : {
  	type: String,
  	default:""
  },
  lastName : {
  	type: String,
  	default:""
  },
  referralCode : {
  	type: String,
  	default:""
  },
  referredByCode : {
  	type: String,
  	default:""
  },
  totalClicksPurchased: {
	  type: Number,
	  default: 0
  },
  referredByUserID : {
  	type: String,
  	default:""
  },
  password: {
    type: String,
    minlength: 6
  },
  username: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
    index: true
  },
  emailVerified:{
    type: Boolean,
    default: false
  },
  isDeleted:{
    type: Boolean,
    default: false
  },
  updatedAt:{
    type: Date,
    default: new Date()
  },
  createdAt:{
    type: Date,
    default: new Date()
  }
}, {
  timestamps: false,
}, {
  usePushEach: true,
})

module.exports = mongoose.model('User', userSchema);
