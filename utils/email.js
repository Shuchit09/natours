const nodemailer = require("nodemailer");

const sendEmail = async options => {
    // Create Transporter, the one which will send the mail, we will no be using Gmail because only 500 mails can be sent and marked spam, we can use sendgrid or mailgun service

    // we will also use mail trap, for email sending test

    const transporter = nodemailer.createTransport({
        // service: "Gmail",
        // auth: {
        //     user: process.env.EMAIL_USERNAME,
        //     pass: process.env.EMAIL_PASSWORD
        // }
        // // Activate in gmail "less secure app" option


        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // Define the email options

    const mailOptions = {
        from: "Shuchit Singh <shuchit@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail