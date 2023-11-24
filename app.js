if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Built-in modules
const path = require('path');

// Third-party modules  
const express = require('express');
const rateLimit = require('express-rate-limit');
const ejs = require('ejs');
const { fileURLToPath } = require('url');
const csrf = require('csrf'); // Import the csrf module
const mongoose = require("mongoose");
//flash
const flash = require("connect-flash");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);

//utils modules
const {registerValidation,globalErrorHandler} = require("./utils/errorHandlers.js");


// Local modules
const MainRoute = require('./routes/main_routes.js');
const ApiRoutes = require('./routes/api_routes.js');
const DethClockRoutes = require('./routes/deathclock_routes.js');
const terrorTalesRoutes = require('./routes/terrortales_routes.js');
const UserRoutes = require("./routes/user_routes.js");


// Create Express app
const app = express();

// Connect to MongoDB
const DB = process.env.DB_URL;

//ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");


app.use(flash());

const store = new mongoDBstore({
  uri: DB,
  collection: "sessions",
  expires: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000, // Same value as expires for the cookie
    },
  })
);


// Built-in middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Security best practices 
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100
}));

// Create a new token generation/verification instance
const tokens = new csrf();

// CSRF middleware
app.use((req, res, next) => {
  // Generate a new CSRF token
  const token = tokens.create(process.env.SESSION_SECRET);

  // Set the CSRF token on the response header
  res.setHeader('X-CSRF-Token', token);

  // Store the CSRF token in res.locals for easy access in views
  res.locals.csrfToken = token;

  // Continue with the request
  next();
});



// Routes
app.use("/user", UserRoutes);
app.use(ApiRoutes);
app.use("/deathClock", DethClockRoutes);
app.use("/terrorTales", terrorTalesRoutes);
app.use(MainRoute);

//error handler
app.use("*", (req,res,next)=>{
  console.log("404 page not found");
  const error = new Error("Page not found");
  error.status = 404;

  globalErrorHandler(req,res,error.status,error.message,error);

  
});


// Start server
const PORT = process.env.PORT || 3001;

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




