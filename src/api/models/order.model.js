const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  totalClicks : {
  	type: Number,
  	required: true
  },
  launchDate : {
  	type: Date,
  	required: true
  },
  websites : {
  	type: [],
  	required: true
  },
  cardNumber : {
  	type: String,
  	required: true
  },
  cardType : {
  	type: String,
  	required: true
  },
  expiry : {
  	type: String,
  	required: true
  },
  cvv : {
  	type: String,
  	required: true
  },
  invoiceID : {
  	type: String,
  	default:""
  },
  paymentStatus : {
  	type: Number,
  	default:0
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

module.exports = mongoose.model('Order', orderSchema);
