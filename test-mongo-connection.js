const mongoose = require('mongoose');

const uri = 'mongodb+srv://capl:capl%40123@gateaiprep.iiegdiv.mongodb.net/?retryWrites=true&w=majority&appName=GATEAIPrep';

console.log('🔍 Testing MongoDB Atlas Connection...\n');
console.log('URI:', uri.replace(/:[^:]*@/, ':****@'));

mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000 
})
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB!\n');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ FAILED: Cannot connect to MongoDB\n');
    console.log('Error Code:', err.code);
    console.log('Error Message:', err.message);
    console.log('\n📋 Possible Solutions:');
    console.log('1. Check MongoDB Atlas cluster is RUNNING');
    console.log('2. Whitelist your IP in Network Access');
    console.log('3. Verify username/password are correct');
    console.log('4. Check firewall/network connection to MongoDB');
    process.exit(1);
  });
