const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { verifyToken, allowRoles } = require("../middlewares/authMiddleware");

// Public route: submit new member request
router.post("/request", memberController.submitRequest);

// Admin/SuperAdmin protected routes
router.use(verifyToken); // all routes below require valid JWT
router.use(allowRoles("ADMIN", "SUPER_ADMIN")); // only Admin or SuperAdmin

// Toggle form (admin only)
router.post("/form", memberController.toggleForm);
router.get("/form", memberController.getFormStatus);

// Get all members
router.get("/", memberController.getAllMembers);

// Approve member
router.put("/approve/:id", memberController.approveMember);

// Reject member
router.delete("/reject/:id", memberController.rejectMember);

// Update member
router.put("/:id", memberController.updateMember);

// memberRoutes.js
router.get("/public", memberController.getPublicMembers);



module.exports = router;
