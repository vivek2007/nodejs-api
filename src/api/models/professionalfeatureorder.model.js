const mongoose = require('mongoose')
autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const professionalfeatureorderSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  orderAmount : {
  	type: Number,
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

professionalfeatureorderSchema.plugin(autoIncrement.plugin, { model: 'Order', field: 'invoiceID' })

module.exports = mongoose.model('Professionalfeatureorder', professionalfeatureorderSchema);
