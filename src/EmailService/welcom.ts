import mssql from "mssql";
import { sqlConfig } from "../Config";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import { sendMail } from "../Helpers/sendMail";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  about: string;
  role: string;
  title: string;
  isDeleted: number;
}

export const sendWelcomeEmail = async () => {
  const pool = await mssql.connect(sqlConfig);
  const users: User[] = (
    await (await pool.request()).query("SELECT * FROM Users WHERE emailSent=0")
  ).recordset;
  console.log(users);

  // looping through and send an email
  for (let user of users) {
    ejs.renderFile(
      "dist/EmailTemplate/welcomeEmail.ejs",
      { username: user.username },
      async (err, html) => {
        if (err) {
          console.log(err);
          return;
        }
        //send email
        try {
          let messageOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Welcome To YouFix",
            html,
          };
          await sendMail(messageOptions);
          //update the database email was sent
          await pool
            .request()
            .query(`UPDATE Users SET emailSent=1 WHERE id='${user.id}'`);
        } catch (error) {
          console.log(error);
        }
      }
    );
  }
};
