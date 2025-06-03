const nodemailer = require("nodemailer");
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours  <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject) {
        // Send the actual email
        // 1. Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        // 2. Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)//converts all html to simple text, using html-to-text package
        }

        // 3. Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token is valid for only 10 minutes.');
    }
}

// const sendEmail = async options => {
//     // Create Transporter, the one which will send the mail, we will no be using Gmail because only 500 mails can be sent and marked spam, we can use sendgrid or mailgun service

//     // we will also use mail trap, for email sending test

//     // const transporter = nodemailer.createTransport({
//     //     // service: "Gmail",
//     //     // auth: {
//     //     //     user: process.env.EMAIL_USERNAME,
//     //     //     pass: process.env.EMAIL_PASSWORD
//     //     // }
//     //     // // Activate in gmail "less secure app" option


//     //     host: process.env.EMAIL_HOST,
//     //     port: process.env.EMAIL_PORT,
//     //     secure: false,
//     //     auth: {
//     //         user: process.env.EMAIL_USERNAME,
//     //         pass: process.env.EMAIL_PASSWORD
//     //     }
//     // })

//     // Define the email options

//     // const mailOptions = {
//     //     from: "Shuchit Singh <shuchit@gmail.com>",
//     //     to: options.email,
//     //     subject: options.subject,
//     //     text: options.message,
//     //     // html:
//     // }

//     // Actually send the email
//     await transporter.sendMail(mailOptions);
// }

// module.exports = sendEmail