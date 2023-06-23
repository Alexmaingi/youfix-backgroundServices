"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = void 0;
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
const ejs_1 = __importDefault(require("ejs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = require("../Helpers/sendMail");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const sendWelcomeEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
    const users = (yield (yield pool.request()).query("SELECT * FROM Users WHERE emailSent=0")).recordset;
    console.log(users);
    // looping through and send an email
    for (let user of users) {
        ejs_1.default.renderFile("dist/EmailTemplate/welcomeEmail.ejs", { username: user.username }, (err, html) => __awaiter(void 0, void 0, void 0, function* () {
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
                yield (0, sendMail_1.sendMail)(messageOptions);
                //update the database email was sent
                yield pool
                    .request()
                    .query(`UPDATE Users SET emailSent=1 WHERE id='${user.id}'`);
            }
            catch (error) {
                console.log(error);
            }
        }));
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
