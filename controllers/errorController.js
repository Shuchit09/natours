const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${(err.keyValue.name)}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data: ${errors.join('. ')}`
    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}
const sendErrorProd = (err, res) => {
    // operational, trusted error: send message  to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {// programming or unknown error: don't leak error details 
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
}

module.exports = (err, req, res, next) => {
    // console.log(err.stack) // call stack gets printed
    err.statusCode = err.statusCode || 500; // 500 for internal server error
    err.status = err.status || "Error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        let { name } = err;

        if (name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error._message === "Validation failed") error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    };
}
