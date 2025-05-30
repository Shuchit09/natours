const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require("./routes/userRoutes")
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')
const reviewRouter = require("./routes/reviewRoutes")

const app = express();
const allowedFields = ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', "difficulty", "price"]

// MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development loggin
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

// Limits requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter); // applying rate limit for /api url, so used at the top

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));//limiting data coming in body

// Data sanitization against NoSQL query injection
// e.g. {"email": {"$gt":""}}, will return all the users
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [...allowedFields]
})); //solves duplicate params, making only to use the last one, white listed params will be allowed to be duplicates

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test Middleware
app.use((req, res, next) => {
    // console.log('Hello from the middleware!!!')
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next();
})

// ROUTE HANDLING MIDDLEWARES
// For tours route
app.use('/api/v1/tours', tourRouter);
// For users route
app.use('/api/v1/users', userRouter);
// For reviews route
app.use('/api/v1/reviews', reviewRouter);
// For unhandled routes 
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error("Can't resolve error");
    // err.status = "fail";
    // err.statusCode = 404; //should be meaningful
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;