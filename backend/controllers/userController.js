const { users } = require("../data/userData");

// SuperAdmin: create new admin
exports.createAdmin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ message: "Username & password required" });

  const id = users.length + 1;
  const newAdmin = { id, username, password, role: "ADMIN" };
  users.push(newAdmin);

  res.json({ message: "Admin created", user: newAdmin });
};

// List all users
exports.getAllUsers = (req, res) => {
  res.json(users);
};

// Delete user
exports.deleteUser = (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  const deleted = users.splice(index, 1);
  res.json({ message: "User deleted", user: deleted[0] });
};

// Update user
exports.updateUser = (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { username, password } = req.body;
  user.username = username || user.username;
  user.password = password || user.password;

  res.json({ message: "User updated", user });
};
