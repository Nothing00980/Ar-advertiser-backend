var mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {type:String,default:''},
    phonenumber : {type:String,unique:true,default:'nan'},
  email: { type: String, unique: true,default:'' },
  password: { type: String, default:'' }
});
module.exports = mongoose.model('user-data', userSchema);