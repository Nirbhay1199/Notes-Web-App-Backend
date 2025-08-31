# Notes App Backend API

A robust RESTful API for a notes application with JWT authentication and email OTP verification using AuthSignal (mocked for development).

## Features

- **User Authentication**: JWT-based authentication with email OTP verification
- **Notes Management**: CRUD operations for user notes
- **Security**: Rate limiting, CORS, Helmet security headers
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: Complete Postman collection included
- **Mock OTP Service**: For development and testing without external dependencies

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd notes-app-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/notes-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# AuthSignal Configuration (for production)
# AUTHSIGNAL_API_KEY=your-authsignal-api-key
# AUTHSIGNAL_WORKFLOW_ID=your-workflow-id
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database and collections

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Start the Application

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. User Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "dob": "1990-01-01"
}
```

#### 2. Verify OTP (Signup)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 3. User Signin
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 4. Verify OTP (Signin)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Notes Endpoints

#### 1. Create Note
```http
POST /api/notes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note"
}
```

#### 2. Get All Notes
```http
GET /api/notes
Authorization: Bearer <jwt-token>
```

#### 3. Get Note by ID
```http
GET /api/notes/:id
Authorization: Bearer <jwt-token>
```

#### 4. Update Note
```http
PUT /api/notes/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### 5. Delete Note
```http
DELETE /api/notes/:id
Authorization: Bearer <jwt-token>
```

### Health Check
```http
GET /api/health
```

## Testing

### Using Postman Collection

1. Import the `Notes-App-API.postman_collection.json` file into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `test_email`: Your test email
   - `test_name`: Your test name
   - `test_dob`: Your test date of birth
   - `jwt_token`: Will be automatically set after authentication

### Manual Testing

You can test the API endpoints using curl or any HTTP client:

```bash
# Health check
curl http://localhost:3000/api/health

# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","dob":"1990-01-01"}'
```

## Project Structure

```
notes-app-backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server startup
│   ├── config/
│   │   ├── cors.js            # CORS configuration
│   │   ├── database.js        # MongoDB connection
│   │   ├── jwt.js             # JWT configuration
│   │   ├── rateLimit.js       # Rate limiting configuration
│   │   └── session.js         # Session configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── notesController.js # Notes CRUD operations
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── validation.js      # Request validation
│   ├── models/
│   │   ├── Note.js            # Note model
│   │   ├── OTP.js             # OTP model
│   │   └── User.js            # User model
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   ├── notesRoutes.js     # Notes routes
│   │   └── index.js           # Route aggregator
│   └── services/
│       └── authSignalService.js # OTP service (mocked)
├── package.json
├── .env                       # Environment variables
└── README.md
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Input Validation**: Request data validation using express-validator
- **OTP Expiration**: Time-based OTP expiration (10 minutes)

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
```

### Build and Deploy

1. Set up your production environment variables
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t notes-app-backend .
docker run -p 3000:3000 notes-app-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration time

3. **OTP Not Working**
   - Check console logs for OTP codes (mock service)
   - Verify email format in requests

4. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing processes on the port

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=app:*
```

## Support

For questions or issues, please:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the Postman collection for examples
4. Create an issue in the repository

---

**Happy Coding!**
