const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Charity = require('./models/Charity');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const gp = await Charity.findOne({ name: 'Greenpeace' });
  console.log('Greenpeace record:', JSON.stringify(gp, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
