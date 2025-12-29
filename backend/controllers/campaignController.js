let campaigns = []; // Temporary in-memory

exports.createCampaign = (req, res) => {
  const { title, description, imageUrl } = req.body;
  const id = campaigns.length + 1;
  const newCampaign = { id, title, description, imageUrl };
  campaigns.push(newCampaign);
  res.json({ message: "Campaign created", campaign: newCampaign });
};

exports.getAllCampaigns = (req, res) => {
  res.json(campaigns);
};

exports.getCampaignById = (req, res) => {
  const campaign = campaigns.find(c => c.id == req.params.id);
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });
  res.json(campaign);
};

exports.updateCampaign = (req, res) => {
  const campaign = campaigns.find(c => c.id == req.params.id);
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });

  const { title, description, imageUrl } = req.body;
  campaign.title = title || campaign.title;
  campaign.description = description || campaign.description;
  campaign.imageUrl = imageUrl || campaign.imageUrl;

  res.json({ message: "Campaign updated", campaign });
};

exports.deleteCampaign = (req, res) => {
  const index = campaigns.findIndex(c => c.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Campaign not found" });
  const deleted = campaigns.splice(index, 1);
  res.json({ message: "Campaign deleted", campaign: deleted[0] });
};
