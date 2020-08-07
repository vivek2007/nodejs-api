const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  postID : {
  	type: String,
  	required: true
  },
  comment:{
	  type: String,
	  default:""
  },
  isDeleted:{
	  type: Boolean,
	  default:false
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

module.exports = mongoose.model('Comment', commentSchema);
