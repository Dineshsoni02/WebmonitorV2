import nodemailer from "nodemailer";

// Create transporter lazily to ensure env vars are loaded
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.G_EMAIL,
        pass: process.env.G_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "Web-watch support <" + process.env.G_EMAIL + ">",
    to,
    subject,
    text,
  };

  await getTransporter().sendMail(mailOptions);
};
