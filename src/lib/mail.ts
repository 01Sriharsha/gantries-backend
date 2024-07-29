import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { emailVerificationMailTemplate } from "./mail-template";
import { config } from "../config";

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "Google",
  host: "smtp.gmail.com",
  port: parseInt(config.mail.port),
  secure: true,
  auth: {
    user: config.mail.admin.mail,
    pass: config.mail.admin.password,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages:", success);
  }
});

export const sendEmailVerificationMail = async (to: string, token: string) => {
  const mailOptions: MailOptions = {
    from: config.mail.admin.mail,
    subject: "Verify your email",
    to,
    html: emailVerificationMailTemplate(token),
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
