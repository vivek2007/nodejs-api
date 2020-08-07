const mongoose = require('mongoose')

const membershiplevelSchema = new mongoose.Schema({
  level : {
  	type: Number,
  	required: true
  },
  clicks : {
  	type: Number,
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

module.exports = mongoose.model('Membershiplevel', membershiplevelSchema);
