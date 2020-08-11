const mongoose = require('mongoose')

const professionalfeatureSchema = new mongoose.Schema({
  amount : {
  	type: Number,
  	required: true
  },
  name : {
  	type: String,
  	required: true
  },
  description : {
  	type: String,
  	required: true
  },
  createdAt:{
    type: Date,
    default: new Date()
  },
  updatedAt:{
    type: Date,
    default: new Date()
  }
}, {
  timestamps: false,
}, {
  usePushEach: true,
})

module.exports = mongoose.model('Professionalfeature', professionalfeatureSchema);
