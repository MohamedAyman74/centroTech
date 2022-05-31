const nodemailer = require("nodemailer");

module.exports.sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: "centrotech2022@gmail.com",

        pass: "a7alol123",
      },
    });

    const message = {
      from: "centrotech2022@gmail.com",

      to: email,

      subject: subject,

      html: text,
    };

    await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (e) {
    console.log(error, "Email not sent");
  }
};
