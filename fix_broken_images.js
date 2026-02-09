const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();
const House = require('./models/House');

const reliableImages = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
];

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

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const houses = await House.find({});
    console.log(`Auditing ${houses.length} houses...\n`);
    
    let fixedCount = 0;
    for (let house of houses) {
      const status = await checkUrl(house.imageUrl);
      if (status !== 200 && status !== 301 && status !== 302) {
        console.log(`Replacing broken image for: ${house.address}`);
        const randomImage = reliableImages[Math.floor(Math.random() * reliableImages.length)];
        house.imageUrl = randomImage;
        await house.save();
        fixedCount++;
      }
    }
    
    console.log(`\n🎉 DONE! Fixed ${fixedCount} houses.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixImages();
