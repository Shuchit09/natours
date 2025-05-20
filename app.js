const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();

// MIDDLEWARES

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`))
// app.use((req, res, next) => {
//     // console.log('Hello from the middleware!!!')
//     next();
// })
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error("Can't resolve error");
    // err.status = "fail";
    // err.statusCode = 404; //should be meaningful

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
}) // to handle all the unhandled routes

app.use(globalErrorHandler);

module.exports = app;