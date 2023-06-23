import cron from "node-cron";
import { sendWelcomeEmail } from "./EmailService/welcom";
import { sendPreferredEmail } from "./EmailService/isAccepted";

cron.schedule(" */2 * * * * *", async () => {
  await sendWelcomeEmail();
});

cron.schedule(" */2 * * * * *", async () => {
  await sendPreferredEmail();
});
