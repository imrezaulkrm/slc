const { members, joinForm } = require("../data/memberData");

// Admin toggles form ON/OFF
exports.toggleForm = (req, res) => {
  const { isActive, code } = req.body;
  joinForm.isActive = !!isActive;
  if (code) joinForm.code = code;
  res.json({ message: "Form updated", joinForm });
};

// Public: Submit new member request
exports.submitRequest = (req, res) => {
  const { name, email, joinCode } = req.body;

  if (!joinForm.isActive) {
    return res.status(400).json({ message: "Form is not active" });
  }

  if (joinCode !== joinForm.code) {
    return res.status(400).json({ message: "Wrong join code" });
  }

  const id = members.length + 1;
  const newMember = { id, name, email, status: "PENDING" };
  members.push(newMember);

  res.json({ message: "Request submitted", member: newMember });
};

// Admin: Approve member
exports.approveMember = (req, res) => {
  const member = members.find(m => m.id == req.params.id);
  if (!member) return res.status(404).json({ message: "Member not found" });

  member.status = "ACTIVE";
  res.json({ message: "Member approved", member });
};

// Admin: Reject member
exports.rejectMember = (req, res) => {
  const index = members.findIndex(m => m.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Member not found" });

  const rejected = members.splice(index, 1);
  res.json({ message: "Member rejected", member: rejected[0] });
};

// Admin: List all members
exports.getAllMembers = (req, res) => {
  res.json(members);
};
