import mssql from "mssql";
import { sqlConfig } from "../Config";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import { sendMail } from "../Helpers/sendMail";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface UserAnswered {
  userId: string;
  username: string;
  email: string;
  role: string;
  answerId: string;
  title: string;
}

export const sendPreferredEmail = async () => {
  const pool = await mssql.connect(sqlConfig);
  const users: UserAnswered[] = (
    await (
      await pool.request()
    ).query(` SELECT
    U.id,
    A.id,
    U.username,
    U.email,
    U.role,
    Q.title 
  FROM
    Users U
  JOIN
    Answers A ON U.id = A.userId
  JOIN
    Questions Q ON Q.id = A.questionId
    
    where A.isAccepted = 1 and A.emailSent=0;`)
  ).recordset;
  console.log(users);

  // looping through and send an email
  for (let user of users) {
    ejs.renderFile(
      "dist/EmailTemplate/isAcceptedEmail.ejs",
      { username: user.username, question: user.title },
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
            subject: "Congrats!",
            html,
          };
          await sendMail(messageOptions);
          //update the database email was sent
          await pool
            .request()
            .query(
              `UPDATE Answers SET emailSent=1 WHERE userId='${user.userId}' and id='${user.answerId}'`
            );
        } catch (error) {
          console.log(error);
        }
      }
    );
  }
};
