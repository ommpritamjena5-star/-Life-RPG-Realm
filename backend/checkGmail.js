import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''),
  },
});

async function verifyAndSend() {
  try {
    console.log('Verifying connection with smtp.gmail.com...');
    await transporter.verify();
    console.log('✅ Google SMTP connection verified successfully!');

    console.log('Sending test email to ommjena25@gmail.com...');
    const info = await transporter.sendMail({
      from: `"Life RPG Realm" <${process.env.EMAIL_USER}>`,
      to: 'ommjena25@gmail.com',
      subject: 'Life RPG - Password Recovery Code: 839201',
      text: 'Greetings Hero! Your Life RPG password recovery code is: 839201. This code expires in 15 minutes. If you did not request this, please ignore this message.',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #07080e; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #f59e0b; text-align: center;">Life RPG - Password Recovery</h2>
          <p style="color: #e2e8f0; font-size: 14px;">Greetings Hero, enter this 6-digit Rune Code to restore your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="background: #1e1b4b; border: 2px dashed #f59e0b; color: #fbbf24; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px; display: inline-block;">839201</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Valid for 15 minutes.</p>
        </div>
      `,
    });

    console.log('✅ Mail sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

verifyAndSend();
