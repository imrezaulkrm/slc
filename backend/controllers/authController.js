const users = require("../data/tempData");

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid login" });

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
};
