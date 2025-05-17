const mongoose = require('mongoose')
const dotenv = require('dotenv');
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
    .catch((error) => {
        console.error(error);
    })

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});