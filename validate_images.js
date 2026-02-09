const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();
const House = require('./models/House');

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve(res.statusCode);
      });
      req.on('error', () => resolve(null));
      req.end();
    } catch (e) {
      resolve(null);
    }
  });
}

async function validateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const houses = await House.find({});
    console.log(`Total houses to check: ${houses.length}\n`);
    
    for (let house of houses) {
      const url = house.imageUrl;
      if (!url) {
        console.log(`❌ HOUSE: ${house.address} - IMAGE IS MISSING`);
        continue;
      }
      
      const status = await checkUrl(url);
      if (status === 200 || status === 301 || status === 302) {
        console.log(`✅ HOUSE: ${house.address} - IMAGE OK (${status})`);
      } else {
        console.log(`❌ HOUSE: ${house.address} - IMAGE FAILED (${status || 'ERROR'}) - URL: ${url.substring(0, 50)}...`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

validateImages();
