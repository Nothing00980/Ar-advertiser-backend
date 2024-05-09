const mongoose = require('mongoose');
const { type } = require('os');

// Define the schema for cart details (representing each product in the cart)
const cartDetailSchema = new mongoose.Schema({
    ObjectId : {type:mongoose.Schema.Types.ObjectId,ref:'maindata',require:true},
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  calories :{type:String,default:''},
  protein : {type:String,default:''},
  sodium : {type:String,default:''},
  sugar :{type:String,default:''}
  
});

const paymentConfirmationSchema = new mongoose.Schema({
    paymentId: { type: String, required: true }, // Payment ID or token
    amount: { type: Number, required: true },
    // Add other payment details as needed
  });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user
    phone: {type:Number,ref:'User',required:true},
    items: [cartDetailSchema],
     paymentConfirmation: paymentConfirmationSchema,  // Array of cart details representing multiple products
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the cart was created
  });

  const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;