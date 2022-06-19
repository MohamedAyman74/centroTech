const nodemailer = require("nodemailer");

module.exports.sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "hotmail",

      auth: {
        user: "centrotech2022@outlook.com",

        pass: "a7alol123",
      },
    });

    const message = {
      from: "centrotech2022@outlook.com",

      to: email,

      subject: subject,

      html: text,
    };

    await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (e) {
    console.log(e, "Email not sent");
  }
};
