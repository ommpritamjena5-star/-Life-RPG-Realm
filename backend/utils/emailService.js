import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory and current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Create transporter with environment config or fallback test transport
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : null;
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : null;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE !== 'false',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return null;
};

const getBaseStyles = () => `
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #07080e;
  color: #e2e8f0;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
`;

const wrapInTemplate = ({ title, preheader, contentHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${getBaseStyles()}">
  <div style="display:none;font-size:1px;color:#07080e;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07080e; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0d0f1a; border: 1px solid #2e1065; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
          <!-- Header Banner with Official Crest Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #091326 0%, #1e1b4b 50%, #030712 100%); padding: 36px 25px; text-align: center; border-bottom: 2px solid #38bdf8;">
              <div style="text-align: center; margin-bottom: 16px;">
                <img src="cid:liferpg-logo" width="110" height="110" alt="Life RPG Crest" style="width: 110px; height: 110px; border-radius: 50%; border: 4px solid #38bdf8; box-shadow: 0 0 30px rgba(56, 189, 248, 0.7); display: inline-block; vertical-align: middle;" />
              </div>
              <div style="display: inline-block; background: #07080e; padding: 10px 22px; border-radius: 14px; border: 1.5px solid #38bdf8; margin-bottom: 10px; box-shadow: 0 0 24px rgba(56, 189, 248, 0.35);">
                <span style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #38bdf8; text-transform: uppercase;">LIFE RPG</span>
              </div>
              <p style="margin: 0; color: #c084fc; font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
                Hero Operating System & Quest Realm
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 35px 30px; color: #cbd5e1; font-size: 14px; line-height: 1.7;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer with Logo Badge -->
          <tr>
            <td style="background-color: #07080e; padding: 25px 30px; text-align: center; border-top: 1px solid rgba(168, 85, 247, 0.2); color: #64748b; font-size: 11px;">
              <div style="text-align: center; margin-bottom: 12px;">
                <img src="cid:liferpg-logo" width="40" height="40" alt="Life RPG" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #38bdf8; display: inline-block; vertical-align: middle;" />
              </div>
              <p style="margin: 0 0 8px 0; color: #94a3b8;">
                Master your real-world habits • Level up your life • Forge your legend
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Life RPG Realm. All rights reserved. Automated Astral Dispatch.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Universal Mail Dispatcher with Console Mock Fallback
 */
export const dispatchEmail = async ({ to, subject, html, text, preheader, attachments = [] }) => {
  const from = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Life RPG Realm" <${process.env.EMAIL_USER}>` : '"Life RPG Realm" <noreply@liferpg.io>');
  const fullHtml = wrapInTemplate({ title: subject, preheader, contentHtml: html });
  const vercelMailUrl = process.env.VERCEL_MAIL_URL;

  console.log(`\n================== 📧 [ASTRAL EMAIL DISPATCH] ==================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${from}`);
  console.log(`Time: ${new Date().toISOString()}`);

  // 1. If VERCEL_MAIL_URL is configured, delegate mail dispatching directly to Vercel Serverless
  if (vercelMailUrl) {
    try {
      console.log(`[Email Service] 🚀 Forwarding email to Vercel Serverless Mailer: ${vercelMailUrl}`);
      const response = await fetch(vercelMailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, text, preheader }),
      });

      const data = await response.json();
      console.log(`[Email Service] ✅ Vercel Serverless response:`, data);
      console.log(`================================================================\n`);
      return { success: true, delivered: data.delivered, provider: 'Vercel Serverless' };
    } catch (err) {
      console.error(`[Email Service] ⚠️ Vercel Mail dispatch failed (${err.message}). Trying fallback transport...`);
    }
  }

  // 2. Direct SMTP transport (local or configured)
  const transporter = getTransporter();

  // Attach logo automatically for inline CID rendering
  const logoPath = path.join(__dirname, '../public/logo.png');
  const mailAttachments = [
    {
      filename: 'logo.png',
      path: logoPath,
      cid: 'liferpg-logo',
    },
    ...attachments,
  ];

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: text || preheader || subject,
        html: fullHtml,
        attachments: mailAttachments,
      });
      console.log(`✅ [Email Service] Real SMTP mail sent successfully! MessageId: ${info.messageId}`);
      console.log(`================================================================\n`);
      return { success: true, messageId: info.messageId, delivered: true, response: info.response };
    } catch (err) {
      console.error(`⚠️ [Email Service] Real SMTP failed (${err.message}). Logged to simulated realm output.`);
      console.log(`================================================================\n`);
      return { success: true, delivered: false, simulated: true, note: err.message };
    }
  } else {
    console.log(`ℹ️ [Email Service] Running in resilient simulated mode (SMTP not configured in .env).`);
    console.log(`✨ The email payload was generated and processed successfully!`);
    console.log(`================================================================\n`);
    return { success: true, delivered: false, simulated: true };
  }
};

/**
 * 1. 🌟 Signup Success (Welcome to Life RPG)
 */
export const sendWelcomeEmail = async ({ to, name, characterClass = 'Novice' }) => {
  const html = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
      <h2 style="color: #f8fafc; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Welcome to the Realm, <span style="color: #f59e0b;">${name}</span>!
      </h2>
      <p style="color: #a855f7; font-size: 13px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
        Class: 🌱 ${characterClass} • Level 1
      </p>
    </div>

    <p style="color: #e2e8f0; font-size: 15px; line-height: 1.7;">
      Your hero soul has been awakened in the <strong>Life RPG Realm</strong>. Every real-world workout, study block, habit, and goal you conquer will now earn you <strong>XP, Gold, and Stat Points</strong>.
    </p>

    <div style="background-color: #131127; border: 1px solid #4c1d95; border-radius: 14px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        ⚔️ Your Starter Quest Checklist
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.8;">
        <li><strong style="color: #38bdf8;">Plan Your Day:</strong> Set your wake-up and sleep schedule in the Daily Planner.</li>
        <li><strong style="color: #38bdf8;">First Focus Session:</strong> Complete a 45-min Pomodoro sprint with soothing rain audio.</li>
        <li><strong style="color: #38bdf8;">Complete 3 Quests:</strong> Earn your first 150 XP and 60 Gold to start leveling up.</li>
        <li><strong style="color: #38bdf8;">Evolve Archetype:</strong> Train your favorite stats to unlock Vanguard Warrior, Arcane Mage, Rogue, or Paladin!</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
        Enter the Hero Dashboard
      </a>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `⚔️ Welcome to Life RPG, ${name}! Your Hero Journey Begins`,
    preheader: `Your Level 1 ${characterClass} has been summoned! Complete your starter quests now.`,
    html,
  });
};

/**
 * 2. 🔐 Login Success (Security Notification)
 */
export const sendLoginSuccessEmail = async ({ to, name, time = new Date().toLocaleString() }) => {
  const html = `
    <div style="margin-bottom: 20px;">
      <h2 style="color: #f8fafc; font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">
        🛡️ Hero Login Alert: <span style="color: #f59e0b;">${name}</span>
      </h2>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">
        We detected a successful login to your Life RPG account.
      </p>
    </div>

    <div style="background-color: #131127; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin: 20px 0;">
      <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8; width: 100px;">Account:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">${to}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Timestamp:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #38bdf8;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Session:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #34d399;">Active Hero Session</td>
        </tr>
      </table>
    </div>

    <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
      If this was you, you can safely disregard this notification. If you did not initiate this login, please change your password in account settings immediately.
    </p>
  `;

  const text = `Hero Login Alert: ${name}\n\nA successful login to your Life RPG account was detected on ${time}.\n\nAccount: ${to}\nStatus: Active Hero Session\n\nIf this was you, no action is needed. If not, please reset your password.`;

  return dispatchEmail({
    to,
    subject: `Life RPG - Login Security Notice (${name})`,
    preheader: `Login detected for your Life RPG hero account on ${time}.`,
    text,
    html,
  });
};

/**
 * 3. 🔑 Forgot Password / Recovery Rune Code
 */
export const sendForgotPasswordEmail = async ({ to, name, resetCode, expiresInMinutes = 15 }) => {
  const html = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 40px; margin-bottom: 10px;">🔮</div>
      <h2 style="color: #f8fafc; font-size: 20px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Password Recovery Rune
      </h2>
      <p style="color: #c084fc; font-size: 13px; margin: 0;">
        Greetings, <strong>${name}</strong>. An arcane request was summoned to reset your password.
      </p>
    </div>

    <p style="color: #cbd5e1; font-size: 14px; text-align: center; margin-bottom: 20px;">
      Enter the following 6-digit Rune Code into the recovery portal:
    </p>

    <div style="text-align: center; margin: 25px 0;">
      <div style="display: inline-block; background: #1a103c; border: 2px dashed #f59e0b; border-radius: 16px; padding: 18px 36px; letter-spacing: 10px; font-size: 32px; font-weight: 900; color: #fbbf24; font-family: monospace; box-shadow: 0 0 30px rgba(245, 158, 11, 0.25);">
        ${resetCode}
      </div>
    </div>

    <p style="color: #ef4444; font-size: 12px; text-align: center; font-weight: bold; margin-bottom: 20px;">
      ⏳ This recovery code expires in ${expiresInMinutes} minutes.
    </p>

    <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
      If you did not request this recovery rune, no action is needed. Your existing password remains encrypted and secure.
    </p>
  `;

  const text = `Greetings ${name}!\n\nYour Life RPG password recovery code is: ${resetCode}\n\nThis 6-digit code expires in ${expiresInMinutes} minutes. If you did not request a password reset, you can safely disregard this email.\n\nEnter this code in the Life RPG app to set your new password.`;

  return dispatchEmail({
    to,
    subject: `Life RPG - Password Recovery Code: ${resetCode}`,
    preheader: `Your password recovery code is ${resetCode}. Valid for ${expiresInMinutes} minutes.`,
    text,
    html,
  });
};

/**
 * 4. ⏰ Daily Quest & Habit Reminder
 */
export const sendQuestReminderEmail = async ({
  to,
  name,
  pendingQuests = [],
  streak = 0,
}) => {
  const questsListHtml = pendingQuests.length > 0
    ? pendingQuests.map((q) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <td style="padding: 10px 0; color: #f8fafc; font-weight: bold;">⚔️ ${q.title}</td>
          <td style="padding: 10px 0; color: #a855f7; text-align: center;">${q.difficulty || 'Normal'}</td>
          <td style="padding: 10px 0; color: #f59e0b; text-align: right; font-weight: bold;">+${q.xpReward || 50} XP</td>
        </tr>
      `).join('')
    : `<tr><td colspan="3" style="padding: 10px 0; color: #94a3b8; text-align: center;">All daily quests cleared! Visit the Quest Board to forge new challenges.</td></tr>`;

  const html = `
    <div style="margin-bottom: 20px;">
      <h2 style="color: #f8fafc; font-size: 18px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase;">
        ⏰ Daily Quest Reminder: Defend Your Streak!
      </h2>
      <p style="color: #c084fc; font-size: 13px; margin: 0;">
        Greetings, Hero <strong>${name}</strong>! Your <strong>🔥 ${streak}-Day Streak</strong> is active.
      </p>
    </div>

    <div style="background-color: #131127; border: 1px solid #4c1d95; border-radius: 14px; padding: 18px; margin: 20px 0;">
      <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
        📋 Pending Daily Quests
      </h3>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #334155; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
            <th style="text-align: left; padding-bottom: 8px;">Quest</th>
            <th style="text-align: center; padding-bottom: 8px;">Tier</th>
            <th style="text-align: right; padding-bottom: 8px;">Reward</th>
          </tr>
        </thead>
        <tbody>
          ${questsListHtml}
        </tbody>
      </table>
    </div>

    <div style="background-color: #1f1224; border: 1px solid #dc2626; border-radius: 12px; padding: 14px; margin-bottom: 25px;">
      <p style="margin: 0; color: #fca5a5; font-size: 12px;">
        ⚠️ <strong>Sloth Penalty Warning:</strong> Incomplete daily quests after midnight will suffer XP & streak decay! Complete them now to protect your rank.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);">
        Open Quest Board & Conquer
      </a>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `⏰ [Daily Reminder] Defend your 🔥 ${streak}-Day Streak in Life RPG!`,
    preheader: `You have pending quests today! Complete them before midnight to avoid Sloth Penalties.`,
    html,
  });
};

/**
 * 5. 🏆 Achievement Unlocked Celebration
 */
export const sendAchievementEmail = async ({
  to,
  name,
  achievementTitle,
  icon = '🏆',
  description,
  xpReward = 100,
  goldReward = 50,
}) => {
  const html = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
      <h2 style="color: #f8fafc; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Achievement Unlocked!
      </h2>
      <div style="display: inline-block; background: #2a1b4e; border: 1px solid #f59e0b; color: #f59e0b; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        ${achievementTitle}
      </div>
    </div>

    <div style="background-color: #131127; border: 1px solid #4c1d95; border-radius: 16px; padding: 22px; text-align: center; margin: 20px 0;">
      <p style="color: #e2e8f0; font-size: 14px; margin: 0 0 16px 0; font-style: italic;">
        "${description}"
      </p>

      <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
        <span style="display: inline-block; background: #07080e; border: 1px solid #38bdf8; color: #38bdf8; padding: 8px 16px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 0 6px;">
          ⚡ +${xpReward} XP
        </span>
        <span style="display: inline-block; background: #07080e; border: 1px solid #fbbf24; color: #fbbf24; padding: 8px 16px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 0 6px;">
          🪙 +${goldReward} Gold
        </span>
      </div>
    </div>

    <p style="color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.6;">
      Your legendary accomplishments have been etched into the <strong>Hall of Heroes</strong>. Keep building real-world momentum!
    </p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
        View Trophy Room
      </a>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `🏆 Achievement Unlocked: [${achievementTitle}] - Life RPG`,
    preheader: `Congratulations ${name}! You unlocked ${achievementTitle} (+${xpReward} XP, +${goldReward} Gold)!`,
    html,
  });
};

/**
 * 6. ⚡ Level Up Celebration Email
 */
export const sendLevelUpEmail = async ({
  to,
  name,
  newLevel,
  newClass = 'Hero',
}) => {
  const html = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 48px; margin-bottom: 10px;">⚡</div>
      <h2 style="color: #f8fafc; font-size: 24px; font-weight: 900; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
        LEVEL UP!
      </h2>
      <div style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #f59e0b 100%); color: #020617; padding: 8px 24px; border-radius: 20px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
        Rank: Level ${newLevel} ${newClass}
      </div>
    </div>

    <div style="background-color: #131127; border: 1px solid #4c1d95; border-radius: 16px; padding: 22px; margin: 20px 0;">
      <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
        🎁 Milestone Rewards Awarded
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.8;">
        <li><strong style="color: #fbbf24;">+50 Bonus Gold</strong> added to your treasury.</li>
        <li><strong style="color: #38bdf8;">All 6 RPG Stats boosted</strong> (+1 Strength, Intellect, Vitality, Agility, Discipline, Charisma).</li>
        <li><strong style="color: #c084fc;">Higher Tier Bazaar Items</strong> unlocked in the Treasury!</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
        Claim Level Rewards
      </a>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `⚡ LEVEL UP! ${name} is now Level ${newLevel} in Life RPG!`,
    preheader: `Congratulations ${name}! You reached Level ${newLevel} and earned +50 Gold and Stat upgrades!`,
    html,
  });
};
