// Built-in modules
import path from 'path';

// Third-party modules  
import express from 'express';
import session from 'express-session'; 
import rateLimit from 'express-rate-limit';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import csrf from 'csrf';
//mongoose
import mongoose from "mongoose";


// Local modules
import MainRoute from './routes/main_routes.js';
import ApiRoutes from './routes/api_routes.js';

// Load environment variables
import dotenv from 'dotenv';
import { CONNREFUSED } from 'dns';
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
const DB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x2mifua.mongodb.net/terrorHub`;

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built-in middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

// Security best practices 
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100
}));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create a new token generation/verification instance
const tokens = new csrf();

// CSRF middleware
app.use((req, res, next) => {

  // Create token
  const token = tokens.create(process.env.SESSION_SECRET);  

  // Set on res.locals
  res.locals.csrfToken = token;

  next();
  
});

// Routes
app.use(ApiRoutes);
app.use(MainRoute);

// Central error handling
app.use((err, req, res, next) => {
  // Handle the error
  console.error(err);

  // Determine the status code and error message
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parse error
    statusCode = 400;
    errorMessage = 'Bad Request';
  }

  // Set the response status code and send an error response
  res.status(statusCode).json({ error: errorMessage });
});

// Start server
const PORT = process.env.PORT || 3000;


const db_connect = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

  } catch (error) {
    console.log(error);
  }
};


// Start server and connect to MongoDB
app.listen(PORT, () => {

  console.log(`Server is listening on port ${PORT}`);  
  db_connect(); 

});
