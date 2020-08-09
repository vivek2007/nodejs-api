const mongoose = require('mongoose')
autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const orderSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  totalClicks : {
  	type: Number,
  	required: true
  },
  additionalClicks : {
  	type: Number,
  	default: 0
  },
  launchDate : {
  	type: Date,
  	required: true
  },
  websites : {
  	type: [],
  	required: true
  },
  amount : {
  	type: Number
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
  	type: Number
  },
  paymentStatus : {
  	type: Number,
  	default:0
  },
  transactionID : {
  	type: String,
  	default:""
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

orderSchema.plugin(autoIncrement.plugin, { model: 'Order', field: 'invoiceID' })

module.exports = mongoose.model('Order', orderSchema);
