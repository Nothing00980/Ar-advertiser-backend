var mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  barcode : {type:String,require:true},
  productName: { type: String, required: true },
  productdes : {type:String,required : true},
  imageName : {type : String,require:true},
  quantity: { type: String, required: true },
  price: { type: Number, required: true },
  calories: { type: String, required: true },
  protein: { type: String, required: true },
  sodium: { type: String, required: true },
  sugar: { type: String, required: true },


});
module.exports = mongoose.model('maindata', userSchema);