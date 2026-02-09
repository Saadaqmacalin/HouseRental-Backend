const mongoose = require('mongoose');

const uri = 'mongodb+srv://sadak20:S675528@cluster0.vsb182s.mongodb.net/houseRentalDB?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB Atlas.');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.message.includes('IP')) {
      console.log('HINT: This looks like an IP Whitelisting issue.');
    }
    process.exit(1);
  }
}

testConnection();
