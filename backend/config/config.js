require("dotenv").config();

module.exports = {
  DB_TYPE: process.env.DB_TYPE || "SHEET",
  PG_HOST: process.env.PG_HOST,
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_DATABASE: process.env.PG_DATABASE,
  PG_PORT: process.env.PG_PORT || 5432,
  SHEET_ID: process.env.SHEET_ID,
  SHEET_API_KEY: process.env.SHEET_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || "supersecret"
};
