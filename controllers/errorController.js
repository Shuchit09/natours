const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    const message = `Duplicate field: "${field}" with value "${value}". Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: "Something went wrong!",
        msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
    // A. Prod
    if (req.originalUrl.startsWith('/api')) {
        // operational, trusted error: send message  to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } // programming or unknown error: don't leak error details 
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    // operational, trusted error: send message  to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: "Something went wrong!",
            msg: err.message
        })
    } // programming or unknown error: don't leak error details 
    return res.status(500).render('error', {
        title: "Something went wrong!",
        msg: "Please try again later"
    })

}

module.exports = (err, req, res, next) => {
    // console.log(err.stack) // call stack gets printed
    err.statusCode = err.statusCode || 500; // 500 for internal server error
    err.status = err.status || "Error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        let { name } = err;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(err, req, res);
    };
}
