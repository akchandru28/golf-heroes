const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Charity = require('../models/Charity');
const Score = require('../models/Score');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Charity.deleteMany({});
  await Score.deleteMany({});

  // Seed charities
  const charities = await Charity.insertMany([
    {
      name: 'Golf Foundation',
      description: 'Supporting young people through golf, building life skills and opening doors to opportunity.',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      website: 'https://www.golf-foundation.org',
      featured: true,
      events: [{ title: 'Junior Golf Day', date: new Date('2026-06-15'), description: 'Free coaching for under-18s' }],
    },
    {
      name: 'Macmillan Cancer Support',
      description: 'We provide medical, emotional, practical and financial support to people living with cancer.',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400',
      website: 'https://www.macmillan.org.uk',
      featured: true,
    },
    {
      name: 'Greenpeace',
      description: 'Defending our natural world — taking action on climate change, ocean protection and more.',
      image: 'https://picsum.photos/id/10/400/300',
      website: 'https://www.greenpeace.org',
      featured: false,
    },
    {
      name: 'St Mungo\'s',
      description: 'Fighting homelessness — providing shelter, support and routes back to a settled life.',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      website: 'https://www.mungos.org',
      featured: false,
    },
  ]);

  console.log(`✅ ${charities.length} charities seeded`);

  // Seed admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@golfheroes.com',
    password: 'Admin1234!',
    role: 'admin',
    subscriptionStatus: 'active',
    plan: 'yearly',
    subscriptionStartDate: new Date('2026-01-01'),
    subscriptionEndDate: new Date('2027-01-01'),
  });
  await Score.create({ user: admin._id, entries: [] });

  // Seed test subscriber
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const user = await User.create({
    name: 'Test Player',
    email: 'player@golfheroes.com',
    password: 'Player1234!',
    role: 'user',
    subscriptionStatus: 'active',
    plan: 'monthly',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: thirtyDaysFromNow,
    selectedCharity: charities[0]._id,
    charityPercentage: 15,
  });
  await Score.create({
    user: user._id,
    entries: [
      { score: 32, date: new Date('2026-04-18') },
      { score: 28, date: new Date('2026-04-15') },
      { score: 35, date: new Date('2026-04-10') },
      { score: 30, date: new Date('2026-04-05') },
      { score: 22, date: new Date('2026-03-28') },
    ],
  });

  // Seed inactive user
  await User.create({
    name: 'Free User',
    email: 'free@golfheroes.com',
    password: 'Free1234!',
    role: 'user',
  });

  console.log('✅ Users seeded:');
  console.log('   Admin  → admin@golfheroes.com / Admin1234!');
  console.log('   Player → player@golfheroes.com / Player1234!');
  console.log('   Free   → free@golfheroes.com / Free1234!');

  await mongoose.disconnect();
  console.log('🌱 Seed complete!');
};

seed().catch(err => { console.error(err); process.exit(1); });
