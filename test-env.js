require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded (masked)' : 'NOT LOADED');
if (process.env.DATABASE_URL) {
  console.log('URL Length:', process.env.DATABASE_URL.length);
}
