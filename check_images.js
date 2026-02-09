const mongoose = require('mongoose');
require('dotenv').config();
const House = require('./models/House');

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const houses = await House.find({});
    console.log(`Total houses found: ${houses.length}`);
    
    houses.forEach((house, index) => {
      console.log(`${index + 1}. House: ${house.address}`);
      console.log(`   Image URL: ${house.imageUrl || 'MISSING'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkImages();
