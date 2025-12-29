const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const { isAdmin } = require("../middleware/roleMiddleware");

// Public route: get all notices
router.get("/", noticeController.getAllNotices);
router.get("/:id", noticeController.getNoticeById);

// Admin routes (Admin / SuperAdmin)
router.use(isAdmin);
router.post("/", noticeController.createNotice);
router.put("/:id", noticeController.updateNotice);
router.delete("/:id", noticeController.deleteNotice);

module.exports = router;
