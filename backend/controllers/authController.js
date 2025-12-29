const db = require("../config/db");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user;

    if(db.type === "POSTGRES") {
      const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
      user = result.rows[0];
    } else {
      const users = await db.query("users", "getAll");
      user = users.find(u => u.username === username);
    }

    if (!user) return res.status(401).json({ message: "Invalid username" });

    let valid = db.type === "POSTGRES"
      ? bcrypt.compareSync(password, user.password)
      : user.password === password;

    if(!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: "8h" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch(err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
