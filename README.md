# AR Advertiser - Supermarket Buying App Backend

AR Advertiser is a comprehensive backend application for a supermarket buying app. It features user authentication, OTP generation, product management, and cart management, all integrated with MongoDB.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication (Sign up, Login, OTP generation)
- Product management (Add, Update, Delete products)
- Cart management (Add to cart, Remove from cart, Checkout)
- Order management
- Integrated with MongoDB

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Steps
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ar-advertiser.git
    ```
2. Navigate to the project directory:
    ```sh
    cd ar-advertiser
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Set up environment variables (see [Environment Variables](#environment-variables)).

## Usage
1. Start the server:
    ```sh
    npm start
    ```
2. The backend will be running on `http://localhost:3000`.

## API Endpoints

### User Authentication
- **Sign Up**: `POST /api/auth/signup`
    - Body: `{ "username": "example", "password": "password", "email": "email@example.com" }`
- **Login**: `POST /api/auth/login`
    - Body: `{ "username": "example", "password": "password" }`
- **Generate OTP**: `POST /api/auth/otp`
    - Body: `{ "email": "email@example.com" }`

### Product Management
- **Add Product**: `POST /api/products`
    - Body: `{ "name": "Product Name", "price": 100, "category": "Category", "description": "Product description" }`
- **Update Product**: `PUT /api/products/:id`
    - Body: `{ "name": "Updated Name", "price": 150 }`
- **Delete Product**: `DELETE /api/products/:id`

### Cart Management
- **Add to Cart**: `POST /api/cart`
    - Body: `{ "userId": "user123", "productId": "product123", "quantity": 1 }`
- **Remove from Cart**: `DELETE /api/cart/:id`
- **Checkout**: `POST /api/cart/checkout`
    - Body: `{ "userId": "user123" }`

### Order Management
- **Get Orders**: `GET /api/orders`
- **Get Order by ID**: `GET /api/orders/:id`

## Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourdbname
JWT_SECRET=your_jwt_secret_key
OTP_SECRET=your_otp_secret_key
```
## Contributing
 - Contributions are welcome! Please open an issue or submit a pull request.

## License
- This project is licensed under the MIT License. See the LICENSE file for details.
