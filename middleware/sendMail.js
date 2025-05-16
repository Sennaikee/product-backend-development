const nodemailer = require('nodemailer')
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_CODE,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transport