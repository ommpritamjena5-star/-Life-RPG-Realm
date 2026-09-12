import { sendForgotPasswordEmail } from './utils/emailService.js';

async function testDispatch() {
  console.log('Testing live dispatch to ommjena25@gmail.com...');
  const res = await sendForgotPasswordEmail({
    to: 'ommjena25@gmail.com',
    name: 'Hero Omm',
    resetCode: '582914',
    expiresInMinutes: 15,
  });
  console.log('Dispatch result:', res);
}

testDispatch();
