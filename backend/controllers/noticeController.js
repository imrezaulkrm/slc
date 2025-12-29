const { notices } = require("../data/noticeData");

// Admin creates notice
exports.createNotice = (req, res) => {
  const { title, body, language } = req.body;
  const id = notices.length + 1;
  const newNotice = { id, title, body, language, createdAt: new Date() };
  notices.push(newNotice);
  res.json({ message: "Notice created", notice: newNotice });
};


// Get all notices (public for members)
exports.getAllNotices = (req, res) => {
  res.json(notices);
};

// Get single notice by id
exports.getNoticeById = (req, res) => {
  const notice = notices.find(n => n.id == req.params.id);
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  res.json(notice);
};

// Admin updates notice
exports.updateNotice = (req, res) => {
  const notice = notices.find(n => n.id == req.params.id);
  if (!notice) return res.status(404).json({ message: "Notice not found" });

  const { title, body } = req.body;
  notice.title = title || notice.title;
  notice.body = body || notice.body;

  res.json({ message: "Notice updated", notice });
};

// Admin deletes notice
exports.deleteNotice = (req, res) => {
  const index = notices.findIndex(n => n.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Notice not found" });

  const deleted = notices.splice(index, 1);
  res.json({ message: "Notice deleted", notice: deleted[0] });
};
