const mongoose = require('mongoose')
autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const blogSchema = new mongoose.Schema({
  userID : {
  	type: String,
  	required: true
  },
  categoryID : {
  	type: String,
  	required: true
  },
  blogNumber:{
	  type: Number,
  },
  type : {
  	type: String,
  	required: true
  },
  title : {
  	type: String,
  	required: true
  },
  description : {
  	type: String,
  	required: true
  },
  commentsCount:{
	  type: Number,
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

blogSchema.plugin(autoIncrement.plugin, { model: 'Blog', field: 'blogNumber' })

module.exports = mongoose.model('Blog', blogSchema);
