// Built-in modules
import path from 'path';

// Third-party modules
import express from 'express';
import rateLimit from 'express-rate-limit';
import ejs from 'ejs';
import { fileURLToPath } from 'url';


// Local modules
import MainRoute from './routes/main_routes.js';
import ApiRoutes from './routes/api_routes.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Express app
const app = express();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built-in middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Security best practices
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
