const mongoose = require('mongoose')
const dotenv = require('dotenv');

process.on("uncaughtException", err => {
    console.log("UNCAUGHT EXCEPTION! Shutting down...")
    console.log(err.name, err.message)
    process.exit(1);
})

dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// const DB = process.env.DATABASE_LOCAL

mongoose
    .connect(DB, {
        useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(() => {
        console.log("DB connection Successful")
    })

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => { //handles async code
    console.log(err.name, err.message)
    console.log("UNHANDLED REJECTION! Shutting down...")
    // process.exit(1);//exits server, 1 for uncaught exception, abruptly shuts down the application, rather  use soft shut down, shut down the server first
    server.close(() => {
        process.exit(1); //allows server to complete the remaining tasks
    })
})

// console.log(x) //x not defined
