const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "holaamigo420",
  host: "localhost",
  port: 5432,
  database: "whatever",
});

module.exports = pool;
