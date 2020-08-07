const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name : {
  	type: String,
  	required: true
  }
}, {
  timestamps: false,
}, {
  usePushEach: true,
})

categorySchema.plugin(autoIncrement.plugin, { model: 'Category', field: 'categoryNumber' })

module.exports = mongoose.model('Category', categorySchema);
