import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.G_EMAIL,
    pass: process.env.G_PASS,
  },
});

export const sendEmail = async () => {};
