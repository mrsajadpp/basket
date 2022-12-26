const nodemailer = require("nodemailer");
const fs = require('fs');

async function mail(message) {
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'help.traceinc@gmail.com', 
      pass: 'gtlaweiiqczgzzmd'
    },
  });
  let info = await transporter.sendMail({
    from: '"Basket" help.traceinc@gmail.com',
    to: message.email,
    subject: message.title,
    text: message.text,
    html: message.content,
  });
  return true;
}
module.exports = mail;