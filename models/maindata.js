var mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  barcode : {type:String,require:true},
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  calories: { type: String, required: true },
  protein: { type: String, required: true },
  sodium: { type: String, required: true },
  sugar: { type: String, required: true },


});
module.exports = mongoose.model('maindata', userSchema);