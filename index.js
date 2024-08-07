// index.js

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const otpgenerator = require('otp-generator');
const cors = require('cors');
// const fs = require('fs').promises;
const fs = require('fs');
// const path = require('path');

const { PDFDocument, rgb } = require('pdf-lib');

const csv = require('csvtojson');

const twilio = require('twilio');
dotenv.config();

const accountsid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twiliophonenumber = process.env.TWILIOPHONENUMBER;
const client = twilio(accountsid, authToken);
const QRCode = require('qrcode');

// Specify the path to the .env file


const crypto = require('crypto');


const PORT = process.env.PORT || 8000;
const mongodbstring = process.env.MONGO_URL;
const falsehash = crypto.randomBytes(12).toString('hex');
const randomnumber = Math.random();
const secretKey = process.env.SECRETKEY;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/data'); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Rename files to avoid conflicts and maintain file extensions
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const imagestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/images'); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Rename files to avoid conflicts and maintain file extensions
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const imageupload = multer({ storage: imagestorage });



// Connect to MongoDB (replace 'mongodb://localhost:27017/mydatabase' with your MongoDB URI)
mongoose.connect(mongodbstring, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define user schema and model
const User = require('./models/user-data');
const Maindata = require('./models/maindata');
const Cart = require('./models/cart-data');
const { ObjectId } = require('mongodb');

const Userphone = require('./models/user-data-phone');

const otpmap = new Map();

const templatepath = 'templates/temppdf.pdf';



// form data schema


// jwt token validation.

function authenticateToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
    }
    req.userId = decodedToken.userId; // Attach userId to request object
    next();
  });
}

// Create an Express app
const app = express();
app.use(cors());

app.use('/uploads', express.static('uploads'));
app.use('/templates', express.static('templates'));
app.use('/filled_invoices', express.static('filled_invoices'));

// Middleware
app.use(bodyParser.json()); // Parse JSON requests

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<h1>Private API Expo</h1><p>Server is running at http://localhost:${PORT}</p>`);
});

// Provide server information via an API endpoint
app.get('/server-info', (req, res) => {
  res.json({
    message: 'Private API Expo',
    serverAddress: `http://localhost:${PORT}`
  });
});



// handle the otp signup
app.post('/auth/user/send-phone', (req, res) => {

  const { phoneNumber } = req.body;
  console.log(phoneNumber);
  // const formattedPhoneNumber = formatPhoneNumberForIndia(phoneNumber);
  // const phone = '+919522271497';






        const otp = otpgenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

        otpmap.set(phoneNumber, otp);

        client.messages.create({
          body: `Hey Your ar advertiser OTP is ${otp}`,
          from: twiliophonenumber,
          to: phoneNumber
        })
          .then(message => {
            console.log('OTP sent to', phoneNumber, ':', message.accountSid);
            res.status(200).json({ message: 'OTP sent successfully' });
          })
          .catch(error => {
            console.error('Error sending OTP :', error);
            res.status(500).json({ error: "Failed to send OTP" });
          });
      
    });





app.post('/resendotp', (req, res) => {
  const { phoneNumber } = req.body;
  const otp = otpgenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

  otpmap.set(phoneNumber, otp);

  client.messages.create({
    body: `Hey Your ar advertiser OTP is ${otp}`,
    from: twiliophonenumber,
    to: phoneNumber
  })
    .then(message => {
      console.log('OTP sent to', phoneNumber, ':', message.accountSid, ":", otp);
      res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch(error => {
      console.error('Error sending OTP :', error);
      res.status(500).json({ error: "Failed to send OTP" });
    });

});

// verify otp 
app.post('/verify-otp', (req, res) => {
  const { phoneNumber, enteredOTP } = req.body;

  // Check if entered OTP matches the previously generated OTP
  if (enteredOTP === otpmap.get(phoneNumber)) {
    // OTP is correct
    // Check if the user already exists
    Userphone.findOne({ phonenumber: phoneNumber })
      .then(existingUser => {
        if (existingUser) {
          console.log("Existing user");
          // User already exists, generate and send token
          const token = jwt.sign({ userId: existingUser._id }, secretKey);
          return res.status(200).json({ success: true, token, userId: existingUser._id });
        } else {
          // Create new user
          const newUser = new Userphone({
            phonenumber: phoneNumber
             // Replace falsehash with appropriate email or data
          });
          newUser.save()
            .then(savedUser => {
              console.log('User created:', savedUser);
              const token = jwt.sign({ userId: savedUser._id }, secretKey);
              res.status(200).json({ success: true, token, userId: savedUser._id });
            })
            .catch(error => {
              console.error('Error creating user:', error);
              res.status(500).json({ error: 'Failed to create user' });
            });
        }
      })
      .catch(error => {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Failed to find user' });
      });
  } else {
    // Incorrect OTP
    res.status(400).json({ success: false, error: 'Incorrect OTP' });
  }
});





// Routes
app.post('/auth/user/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds parameter

    // Create a new user with hashed password
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Return success response
    res.status(200).json({ success: true, user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }

});



app.post('/auth/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Generate JWT token with no expiration time
    const token = jwt.sign({ email: user.email, userId: user._id }, secretKey);

    // Create a response object with user details and token
    const responseData = {
      success: true,
      message: 'Login successful',
      userId: user._id,
      token,
      // Include additional user details here
      userDetails: {
        username: user.username,
        email: user.email
        // Add more user details as needed
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post('/importdata', upload.single('file'), async (req, res) => {
  try {

    data = [];
    csv()
      .fromFile(req.file.path)
      .then(async response => {
        console.log(response);
        for (let x = 0; x < response.length; x++) {
          data.push({
            barcode: response[x].barcode,
            productName: response[x].productName,
            productdes: response[x].productdes,
            imageName: response[x].imageName,
            quantity: response[x].weight,
            price: response[x].price,
            calories: response[x].calories,
            protein: response[x].protein,
            sodium: response[x].sodium,
            sugar: response[x].sugar


          });
        }
        await Maindata.insertMany(data);


      })


    res.status(200).json({ success: true, message: 'sucessfully added the data' });

  }
  catch (e) {
    res.status(400).json({ success: false, message: e.message });

  }

});


app.post('/barcode-fetch', authenticateToken,async (req, res) => {

  const { barcode } = req.body;
  console.log(barcode);

  try {
    // Search the database for the item by barcode
    const item = await Maindata.findOne({ barcode: barcode });

    if (item) {
      // Item found, send data related to the item back to the client
      res.status(200).json({ success: true, item: item });
    } else {
      // Item not found, send appropriate response to the client
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error searching item:', error);
    res.status(500).json({ error: 'Failed to search item' });
  }





});




// app.post('/checkout', async (req, res) => {
//   // Extract data from request body
//   const { userId, paymentConfirmation, cartDetails } = req.body;

//   console.log(userId);
//   console.log(paymentConfirmation);
//   console.log(cartDetails);






//   if (!userId || !paymentConfirmation || !cartDetails || !Array.isArray(cartDetails) || cartDetails.length === 0) {
//     return res.status(400).json({ error: 'Invalid request data' });
//   }
//   try {


//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Now you have user details, such as email, address, etc., which you can use as needed
//     // const userEmail = user.email;
//     const phone = user.phonenumber;
//     // Create a new cart document
//     const cart = new Cart({
//       userId: userId,
//       phone: phone,
//       paymentConfirmation: paymentConfirmation,
//       items: cartDetails
//     });

//     // Save the cart to the database
//     await cart.save();



//     // Send success response
//     res.status(200).json({ message: 'Cart saved successfully' });
//   } catch (error) {
//     console.error('Error saving cart:', error);
//     res.status(500).json({ error: 'Failed to save cart' });
//   }


// });


// const fs = require('fs');
// const path = require('path');
const pdf = require('pdf-creator-node');
const { v4: uuidv4 } = require('uuid');


const getInvoiceCount = () => {
  const data = fs.readFileSync(path.join(__dirname, 'invoicecount.json'), 'utf-8');
  const jsonData = JSON.parse(data);
  return jsonData.count;
};

// Function to update the invoice count in the JSON file
const updateInvoiceCount = (newCount) => {
  const jsonData = { count: newCount };
  fs.writeFileSync(path.join(__dirname, 'invoicecount.json'), JSON.stringify(jsonData));
};




//  todo : invoicenumber
const generateInvoiceNumber = () => {
  return uuidv4();
};


// todo : current date
const getCurrentDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
  const yyyy = today.getFullYear();

  return dd + '/' + mm + '/' + yyyy;
};




// todo generate pdf

const generatePdf = async (cartDetails, userId, paymentConfirmation,contactInfo, callback) => {
  const html = fs.readFileSync(path.join(__dirname, '/templates/template.html'), 'utf-8');
  const filename = Math.random().toString(36).substring(2, 15) + '_doc.pdf';



  let array = [];

  cartDetails.forEach(d => {
    const prod = {
      name: d.productName,
      quantity: d.quantity,
      price: d.productPrice,
      total: d.quantity * d.productPrice
    };
    array.push(prod);
  });

  let subtotal = 0;
  array.forEach(i => {
    subtotal += i.total;
  });
  const tax = (subtotal * 20) / 100;
  const grandtotal = subtotal + tax;
  const obj = {
    prodlist: array,
    subtotal: subtotal,
    tax: tax,
    gtotal: grandtotal
  };


  const qrCodeData = await QRCode.toDataURL(userId.toString());

  let invoiceCount = getInvoiceCount();
  const document = {
    html: html,
    data: {
      products: obj,
      userId: userId,
      paymentConfirmation: paymentConfirmation,
      contactInfo: contactInfo,
      currentDate: getCurrentDate(),
      invoiceNumber: generateInvoiceNumber(),
      invoiceCount: ++invoiceCount,
      qrCode: qrCodeData
    },
    path: path.join(__dirname, '/uploads/invoices/', filename)
  };
  const options = {}; // Define any necessary options for pdf-creator-node

  pdf.create(document, options)
    .then(result => {
      console.log(result);
      const filepath = 'http://localhost:3000/uploads/invoices/' + filename;
      callback(null, filepath);
    }).catch(error => {
      console.log(error);
      callback(error);
    });
};

app.post('/checkout', authenticateToken,async (req, res) => {
  const { userId, paymentConfirmation, cartDetails } = req.body;

  console.log(userId);
  console.log(paymentConfirmation);
  console.log(cartDetails);

  if (!userId  || !paymentConfirmation || !cartDetails || !Array.isArray(cartDetails) || cartDetails.length === 0) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const user = await User.findById(userId);
    const userphone = await Userphone.findById(userId);

    if (!user && !userphone) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contactInfo = user ? user.email : userphone.phonenumber;

   
    console.log(contactInfo ,  "---- ccontaact info");
    if (!contactInfo) {
      return res.status(400).json({ error: 'No contact information available for the user' });
    }
    const cart = new Cart({
      userId: userId,
      contactInfo: contactInfo,
      paymentConfirmation: paymentConfirmation,
      items: cartDetails
    });

    await cart.save();

    generatePdf(cartDetails, userId, paymentConfirmation, contactInfo, (err, filepath) => {
      if (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ error: 'Failed to generate PDF' });
      }
      res.json({ path: filepath });

    });

  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});






app.listen(PORT, () => {
  console.log(`Server is running on port  http://localhost:${PORT}`);
});
