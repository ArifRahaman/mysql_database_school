const mysql = require('mysql2/promise');
require('dotenv').config();
console.log(process.env.HOST);
console.log(process.env.PASSWORD);
console.log(process.env.DATABASE);
console.log(process.env.HOST)
const db = mysql.createPool({
  host: process.env.HOST,       // Your MySQL host (e.g., 'localhost')
  user: process.env.usr,       // Your MySQL username
  password: process.env.PASSWORD, // Your MySQL password
  database: process.env.DATABASE, // Your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
