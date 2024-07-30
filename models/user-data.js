const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, default: '' },
  email: { type: String, unique: true, sparse: true ,required:true},
  password: { type: String,required : true  }
});



module.exports = mongoose.model('user-data', userSchema);
