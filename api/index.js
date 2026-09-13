import app from '../backend/server.js';
import { connectDB } from '../backend/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (dbErr) {
    console.warn('[Vercel Serverless DB Note]:', dbErr.message);
  }
  return app(req, res);
}
