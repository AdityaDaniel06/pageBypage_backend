const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
    //   user: "process.env.your_email",
    //   pass: "process.env.your_password",
    // },
    // ACtivate in gmail: less secure app
    // avoiding gmail because limit 500 mails per day and can be flagged as spammer
    // Faking sending email for development purposes: maketrap
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: "Aditya Daniel <aditya.daniel06@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  console.log("mailOptions", mailOptions);
  // 3)  send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendEmail;
