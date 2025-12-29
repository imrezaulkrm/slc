const express = require("express");
const path = require("path");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const memberRoutes = require("./routes/memberRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/users", userRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

module.exports = app;
