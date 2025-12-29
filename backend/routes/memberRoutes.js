const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { isAdmin } = require("../middleware/roleMiddleware");

// Public route: submit new member request
router.post("/request", memberController.submitRequest);

// Admin routes (Admin / SuperAdmin)
router.use(isAdmin);
router.post("/form", memberController.toggleForm);
router.get("/", memberController.getAllMembers);
router.put("/approve/:id", memberController.approveMember);
router.delete("/reject/:id", memberController.rejectMember);

module.exports = router;
