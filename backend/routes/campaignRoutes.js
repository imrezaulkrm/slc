const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { isAdmin } = require("../middlewares/roleMiddleware");

// Create campaign
router.post("/", isAdmin, campaignController.createCampaign);

// Get all campaigns
router.get("/", campaignController.getAllCampaigns);

// Get single campaign by id
router.get("/:id", campaignController.getCampaignById);

// Update campaign
router.put("/:id", isAdmin, campaignController.updateCampaign);

// Delete campaign
router.delete("/:id", isAdmin, campaignController.deleteCampaign);

module.exports = router;
