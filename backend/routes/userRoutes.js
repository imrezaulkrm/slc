const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isSuperAdmin } = require("../middlewares/roleMiddleware");

// SuperAdmin only routes
router.post("/create-admin", isSuperAdmin, userController.createAdmin);
router.get("/", isSuperAdmin, userController.getAllUsers);
router.put("/:id", isSuperAdmin, userController.updateUser);
router.delete("/:id", isSuperAdmin, userController.deleteUser);

module.exports = router;
