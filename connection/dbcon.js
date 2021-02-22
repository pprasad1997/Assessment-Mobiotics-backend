const mysql = require("mysql");

const host = process.env.DB_HOST || 'localhost';

const user = process.env.DB_USER || 'root';

const password = process.env.DB_PASS || '';

const database = process.env.DB_DATABASE || 'mobiotics';

const conn = mysql.createConnection({
  host,
  user,
  password,
  database
});

conn.connect((err) => {
  if(err) throw err;
  console.log("connected to db");
});

module.exports = conn;
