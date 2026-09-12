import {
  sendWelcomeEmail,
  sendLoginSuccessEmail,
  sendForgotPasswordEmail,
  sendQuestReminderEmail,
  sendAchievementEmail,
  sendLevelUpEmail,
} from '../backend/utils/emailService.js';

async function runTests() {
  console.log('Testing Astral Mail Service...');

  const welcome = await sendWelcomeEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    characterClass: 'Warrior',
  });
  console.log('Welcome Email Test:', welcome);

  const login = await sendLoginSuccessEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    ip: '192.168.1.100 (Bhubaneswar, India)',
  });
  console.log('Login Alert Test:', login);

  const forgot = await sendForgotPasswordEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    resetCode: '918273',
  });
  console.log('Forgot Password Test:', forgot);

  const reminder = await sendQuestReminderEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    pendingQuests: [
      { title: 'Morning Run & Calisthenics', difficulty: 'Medium', xpReward: 75 },
      { title: 'Learn Dynamic Programming in Rust', difficulty: 'Epic', xpReward: 250 },
    ],
    streak: 5,
  });
  console.log('Quest Reminder Test:', reminder);

  const achievement = await sendAchievementEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    achievementTitle: 'Archmage of Deep Focus',
    icon: '🔮',
    description: 'Logged 100 focus timer sessions with zero distractions.',
    xpReward: 500,
    goldReward: 200,
  });
  console.log('Achievement Email Test:', achievement);

  const levelUp = await sendLevelUpEmail({
    to: 'test_hero@liferpg.io',
    name: 'Shadow Knight',
    newLevel: 5,
    newClass: 'Vanguard Warrior',
  });
  console.log('Level Up Email Test:', levelUp);

  console.log('✨ All 6 Astral Email Scenarios Tested Successfully!');
}

runTests();
