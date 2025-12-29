const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { isAdmin } = require("../middlewares/roleMiddleware");

// Create blog (Admin / SuperAdmin)
router.post("/", isAdmin, blogController.createBlog);

// Get all blogs
router.get("/", blogController.getAllBlogs);

// Get single blog by id
router.get("/:id", blogController.getBlogById);

// Update blog (Admin / SuperAdmin)
router.put("/:id", isAdmin, blogController.updateBlog);

// Delete blog (Admin / SuperAdmin)
router.delete("/:id", isAdmin, blogController.deleteBlog);

module.exports = router;
