const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.firstname || "New User";
    this.url = url;
    this.from = `Aditya Daniel <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return 1;
    }

    return nodemailer.createTransport({
      // Faking sending email for development purposes: maketrap
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject,
      }
    );
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    // Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    const subject = "Welcome to PageByPage!";
    await this.send("welcome", subject);
  }

  async sendResetPasswordEmail() {
    const subject = "Reset Password(valid for only 10 minutes";
    await this.send("passwordReset", subject);
  }
};
