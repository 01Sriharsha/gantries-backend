import twilio from "twilio";
import { config } from "../config";

const client = twilio(config.twilio.accountSid, config.twilio.authToken, {
  maxRetries: 3,
});

export const sendSMS = async (to: string, body: string) => {
  const res = await client.messages.create({
    from: "+17622486311",
    to: "+91" + to,
    body,
  });
  if (res.errorMessage || res.errorCode) {
    console.error("Twilio message error:", res.errorMessage);
    throw new Error("Failed to send sms!");
  }
};
