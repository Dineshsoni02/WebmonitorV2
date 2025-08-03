import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.G_EMAIL,
    pass: process.env.G_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "Web-watch support <" + process.env.G_EMAIL + ">",
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
