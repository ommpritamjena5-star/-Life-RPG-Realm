import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { defaultAchievements, defaultShopItems } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/liferpg';

async function resetDatabase() {
  console.log('⚔️ ========================================================');
  console.log('   LIFE RPG DATABASE RESET & PURGE UTILITY');
  console.log('========================================================');
  console.log(`Connecting to database URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const db = conn.connection.db;

    console.log(`✅ Connected to database: "${db.databaseName}" on host: ${conn.connection.host}`);

    // Safety check: Ensure we only reset 'liferpg' and NEVER any other project database!
    if (!db.databaseName.toLowerCase().includes('liferpg')) {
      console.error(`❌ ABORT: Attempting to reset unexpected database "${db.databaseName}". Safety lock engaged!`);
      process.exit(1);
    }

    // 1. List and drop collections in liferpg
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) in "${db.databaseName}":`);

    for (const coll of collections) {
      console.log(`🗑️  Dropping collection: ${coll.name}...`);
      await db.collection(coll.name).drop();
    }

    // 2. Re-seed default items & achievements
    console.log('🌱 Seeding fresh default Bazaar Items & Achievements...');
    if (defaultShopItems && defaultShopItems.length) {
      await db.collection('items').insertMany(defaultShopItems);
      console.log(`✅ Seeded ${defaultShopItems.length} default shop items.`);
    }

    if (defaultAchievements && defaultAchievements.length) {
      await db.collection('achievements').insertMany(defaultAchievements);
      console.log(`✅ Seeded ${defaultAchievements.length} default achievements.`);
    }

    // 3. Reset local db.json
    const localDbPath = path.join(__dirname, '../data/db.json');
    const initialLocalData = {
      users: [],
      quests: [],
      schedules: [],
      sessions: [],
      items: defaultShopItems,
      achievements: defaultAchievements,
      userAchievements: [],
    };

    fs.writeFileSync(localDbPath, JSON.stringify(initialLocalData, null, 2), 'utf-8');
    console.log(`✅ Reset local storage: ${localDbPath}`);

    console.log('========================================================');
    console.log('🎉 SUCCESS: Database "liferpg" has been completely purged and re-initialized!');
    console.log('   - Test accounts: DELETED');
    console.log('   - Test quests & schedules: DELETED');
    console.log('   - Default RPG catalog: RESTORED');
    console.log('   - Other cluster databases (e.g. pritamoria_db): UNTOUCHED & SAFE');
    console.log('========================================================');
  } catch (err) {
    console.error('❌ Error resetting database:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetDatabase();
