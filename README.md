# Product API 

A RESTful API for managing products with user authentication and currency conversion.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone git@github.com:Sennaikee/product-backend-development.git
cd product-backend-development
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Create a .env file
Create a .env file in the root and add the following:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EXCHANGE_API_BASE=https://api.exchangeratesapi.io/v1
EXCHANGE_API_KEY=your_api_key_here
```
## Usage
Run the server:
```bash
npm run dev
```
The server will run on http://localhost:3000.

## Dependencies
* express
* mongoose
* dotenv
* joi
* bcryptjs
* jsonwebtoken
* axios
* nodemon
* cookie-parser
* node-cache


# API Documentation
This API is fully documented and available on Postman. It includes all endpoints with descriptions, required headers, request body formats, and example responses.

🔗 View the documentation: https://documenter.getpostman.com/view/29680255/2sB2j4gr7n


## Endpoints Covered
### Auth
* POST /api/auth/signup

Sample request Body:
```
{
  "username": "Test2",
  "email": "test2@gmail.com",
  "password": "example@12345"
}
```
Response:
```
{
  "success": true,
  "message": "Account created successfully",
  "result": {
    "username": "Test2",
    "email": "test2@gmail.com",
    "verified": false,
    "_id": "599nsios9eu39dur",
    "createdAt": "2025-05-02T18:36:49.400Z",
    "updatedAt": "2025-05-02T18:36:49.400Z",
    "__v": 0
  }
}
```
* POST /api/auth/signin
* POST /api/auth/signout

### Products
* POST /api/products – Create a new product
  
Sample request Body:
```
{
  "name": "Pizza",
  "price": 5.99,
  "description": "Pepperoni",
  "category": "Food"
}
```
Response:
```
{
  "name": "Pizza",
  "price": 5.99,
  "description": "Pepperoni",
  "category": "Food",
  "createdBy": "681510c1a407e9413099e6f7",
  "_id": "681584df4b1490eb1d876f46",
  "createdAt": "2025-05-03T02:52:15.423Z",
  "updatedAt": "2025-05-03T02:52:15.423Z",
  "__v": 0
}
```
* GET /api/products – Get all products
* GET /api/products/:id – Get single product
* PUT /api/products/:id – Update product
* DELETE /api/products/:id – Delete product

### Profile
* PUT /api/user/updateProfile – Update profile
* GET /api/user/getProfile - Get profile

Sample response:
```
{
  "success": true,
  "user": {
    "_id": "681510c1a407e9413099e6f7",
    "username": "Test2",
    "email": "test2@gmail.com",
    "verified": false,
    "createdAt": "2025-05-02T18:36:49.400Z",
    "updatedAt": "2025-05-02T19:48:43.373Z",
    "__v": 0
  }
}
```

### Currency Conversion
* GET /api/products/:id/price-in/currency – Convert product price
  
Sample response:
```
{
  "price": 5419.1,
  "currency": "NGN",
  "exchangeRate": 1812.408452
}
```

## Authorization
Some endpoints require a Bearer Token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```



