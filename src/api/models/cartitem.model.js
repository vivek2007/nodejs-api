const mongoose = require('mongoose')

const cartitemSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  orderID : {
  	type: String,
  	default: ""
  },
  featureID : {
  	type: String,
  	required: true
  },
  amount : {
  	type: Number,
  	default: 0
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

module.exports = mongoose.model('Cartitem', cartitemSchema);
