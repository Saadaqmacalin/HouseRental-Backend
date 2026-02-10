const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();
const House = require('./models/House');

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      if (!url) return resolve(null);
      const options = {
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };
      const req = https.request(url, options, (res) => {
        resolve(res.statusCode);
        res.destroy(); // Stop downloading after headers
      });
      req.on('error', () => resolve(null));
      req.end();
    } catch (e) {
      resolve(null);
    }
  });
}

async function finalAudit() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const houses = await House.find({});
    console.log(`Auditing ${houses.length} houses...`);
    
    const broken = [];
    for (let house of houses) {
      const status = await checkUrl(house.imageUrl);
      if (status !== 200 && status !== 301 && status !== 302) {
        broken.push({ address: house.address, url: house.imageUrl, status });
      }
    }
    
    if (broken.length === 0) {
      console.log('✅ No broken images found!');
    } else {
      console.log(`❌ Found ${broken.length} broken images:`);
      broken.forEach(b => console.log(`- ${b.address}: ${b.url} (${b.status})`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

finalAudit();
