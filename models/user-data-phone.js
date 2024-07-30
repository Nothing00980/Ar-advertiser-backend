const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phonenumber: { type: String, unique: true, sparse: true ,required:true},
});



module.exports = mongoose.model('user-data-phone', userSchema);
