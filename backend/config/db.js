const config = require("./config");
let db;

if (config.DB_TYPE === "POSTGRES") {
  const { Pool } = require("pg");
  const pool = new Pool({
    user: config.PG_USER,
    host: config.PG_HOST,
    database: config.PG_DATABASE,
    password: config.PG_PASSWORD,
    port: config.PG_PORT
  });

  pool.connect()
    .then(async () => {
      console.log("Postgres connected");

      // Users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL
        );
      `);

      // Members table (updated with full fields)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS members (
            id SERIAL PRIMARY KEY,
            member_id VARCHAR(20) UNIQUE,
            name VARCHAR(100),
            father_name VARCHAR(100),
            mother_name VARCHAR(100),
            dob DATE,
            gender VARCHAR(10),
            nid_number VARCHAR(50),
            profile_pic TEXT,
            district VARCHAR(100),
            thana VARCHAR(100),
            postal_code VARCHAR(20),
            address_line TEXT,
            occupation VARCHAR(100),
            phone_number VARCHAR(50),
            whatsapp_number VARCHAR(50),
            email VARCHAR(100),
            emergency_contact VARCHAR(50),
            join_code VARCHAR(50),
            status VARCHAR(20) DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      // New table: join_forms
      await pool.query(`
        CREATE TABLE IF NOT EXISTS join_forms (
          id SERIAL PRIMARY KEY,
          is_active BOOLEAN DEFAULT FALSE,
          join_code TEXT,
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          force_status TEXT DEFAULT 'AUTO',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Notices table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notices (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200),
          body TEXT,
          language VARCHAR(5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Blogs table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200),
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Campaigns table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("All tables are created or already exist!");

      // Default SuperAdmin
      const result = await pool.query(`SELECT * FROM users WHERE role='SUPER_ADMIN'`);
      if (result.rows.length === 0) {
        const bcrypt = require("bcryptjs");
        const passwordHash = bcrypt.hashSync("superadmin123", 10);
        await pool.query(
          `INSERT INTO users(username,password,role) VALUES($1,$2,$3)`,
          ["superadmin", passwordHash, "SUPER_ADMIN"]
        );
        console.log("Default SuperAdmin created: username=superadmin, password=superadmin123");
      }
    })
    .catch(err => console.error("DB connection error:", err));

  db = {
    type: "POSTGRES",
    query: (text, params) => pool.query(text, params),
    pool
  };

} else {
  // SHEET / in-memory fallback
  db = {
    type: "SHEET",
    sheetsData: {
      users: [],
      members: [],
      notices: [],
      blogs: [],
      campaigns: []
    },
    query: async (table, action, payload) => {
      const tableData = db.sheetsData[table];
      switch (action) {
        case "getAll":
          return tableData;
        case "insert":
          const id = tableData.length + 1;
          const newRow = { id, ...payload };
          tableData.push(newRow);
          return newRow;
        default:
          return null;
      }
    }
  };

  // Default SuperAdmin
  const bcrypt = require("bcryptjs");
  const passwordHash = bcrypt.hashSync("superadmin123", 10);
  db.sheetsData.users.push({
    id: 1,
    username: "superadmin",
    password: passwordHash,
    role: "SUPER_ADMIN"
  });
  console.log("Default SuperAdmin created in Sheet: username=superadmin, password=superadmin123");
}

module.exports = db;
