const db = require("../config/db");

// Member ID generate helper
function generateMemberId(nid, dob, phone, name) {
  // NID last 2 digit
  const nidLast2 = nid.slice(-2);

  // DOB digit sum → 3 digit
  const dobDigits = dob.replace(/-/g, "").split("");
  const dobSum = dobDigits.reduce((sum, d) => sum + Number(d), 0);
  const dobPart = String(dobSum).padStart(3, "0");

  // Phone last 2 digit
  const phoneLast2 = phone.slice(-2);

  // Name first 4 letters
  const namePart = name
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `${nidLast2}${dobPart}${phoneLast2}${namePart}`;
}

function isFormActive(form) {
  const now = new Date();
  if (form.force_status === "ON") return true;
  if (form.force_status === "OFF") return false;
  if (!form.is_active) return false;
  if (form.start_time && now < new Date(form.start_time)) return false;
  if (form.end_time && now > new Date(form.end_time)) return false;
  return true;
}


// Admin: Update / toggle form
exports.toggleForm = async (req, res) => {
  const { forceStatus, isActive, joinCode, startTime, endTime } = req.body;
  try {
    // check যদি row থাকে
    const { rows } = await db.query("SELECT * FROM join_forms LIMIT 1");
    let config;
    if (rows.length) {
      // Update যদি row থাকে
      const { rows: updatedRows } = await db.query(
        `
        UPDATE join_forms
        SET force_status = $1,
            is_active = $2,
            join_code = $3,
            start_time = $4,
            end_time = $5,
            updated_at = NOW()
        RETURNING *
        `,
        [forceStatus || "AUTO", !!isActive, joinCode || null, startTime || null, endTime || null]
      );
      config = updatedRows[0];
    } else {
      // Insert যদি row না থাকে
      const { rows: insertedRows } = await db.query(
        `
        INSERT INTO join_forms (force_status, is_active, join_code, start_time, end_time)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [forceStatus || "AUTO", !!isActive, joinCode || null, startTime || null, endTime || null]
      );
      config = insertedRows[0];
    }

    res.json({ message: "Form updated", config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};



// Admin: Get current form status
exports.getFormStatus = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM join_forms ORDER BY id DESC LIMIT 1"
    );
    const form = rows[0];
    res.json({ 
      isActive: isFormActive(form),
      startTime: form.start_time,
      endTime: form.end_time,
      joinCode: form.join_code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};



// Public: submit new member request
exports.submitRequest = async (req, res) => {
  const {
    name,
    father_name,
    mother_name,
    dob,
    gender,
    nid_number,
    profile_pic,
    district,
    thana,
    postal_code,
    address_line,
    occupation,
    phone_number,
    whatsapp_number,
    email,
    emergency_contact,
    joinCode
  } = req.body;

  if (!joinForm.isActive) return res.status(400).json({ message: "Form is not active" });
  if (joinCode !== joinForm.code) return res.status(400).json({ message: "Wrong join code" });

  try {
    if (db.type === "POSTGRES") {
      const query = `
        INSERT INTO members
        (name, father_name, mother_name, dob, gender, nid_number, profile_pic,
         district, thana, postal_code, address_line, occupation, phone_number,
         whatsapp_number, email, emergency_contact, join_code, status)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING *;
      `;
      const values = [
        name, father_name, mother_name, dob, gender, nid_number, profile_pic,
        district, thana, postal_code, address_line, occupation, phone_number,
        whatsapp_number, email, emergency_contact, joinCode, "PENDING"
      ];
      const { rows } = await db.query(query, values);
      res.json({ message: "Request submitted", member: rows[0] });
    } else {
      const newMember = await db.query("members", "insert", {
        name, father_name, mother_name, dob, gender, nid_number, profile_pic,
        district, thana, postal_code, address_line, occupation, phone_number,
        whatsapp_number, email, emergency_contact, join_code: joinCode,
        status: "PENDING"
      });
      res.json({ message: "Request submitted", member: newMember });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Admin: Approve member
exports.approveMember = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.type !== "POSTGRES") {
      return res.status(400).json({ message: "Only supported for Postgres" });
    }

    // 1️⃣ Get member first
    const { rows } = await db.query(
      "SELECT * FROM members WHERE id=$1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = rows[0];

    // 2️⃣ Prevent double approve
    if (member.member_id) {
      return res.status(400).json({ message: "Member already approved" });
    }

    // 3️⃣ Generate member_id
    const memberId = generateMemberId(
      member.nid_number,
      member.dob.toISOString().split("T")[0],
      member.phone_number,
      member.name
    );

    // 4️⃣ Update member
    const { rows: updated } = await db.query(
      `UPDATE members
       SET status='ACTIVE', member_id=$1
       WHERE id=$2
       RETURNING *`,
      [memberId, id]
    );

    res.json({
      message: "Member approved successfully",
      member: updated[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


// Admin: Reject member
exports.rejectMember = async (req, res) => {
  const { id } = req.params;
  try {
    if (db.type === "POSTGRES") {
      const { rows } = await db.query(
        "DELETE FROM members WHERE id=$1 RETURNING *",
        [id]
      );
      if (!rows.length) return res.status(404).json({ message: "Member not found" });
      res.json({ message: "Member rejected", member: rows[0] });
    } else {
      const index = db.sheetsData.members.findIndex(m => m.id == id);
      if (index === -1) return res.status(404).json({ message: "Member not found" });
      const rejected = db.sheetsData.members.splice(index, 1);
      res.json({ message: "Member rejected", member: rejected[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Admin/Frontend: List or search members
exports.getAllMembers = async (req, res) => {
  try {
    const search = req.query.search;
    if (db.type === "POSTGRES") {
      let query = "SELECT * FROM members";
      let values = [];
      if (search) {
        query += " WHERE name ILIKE $1 OR email ILIKE $1";
        values.push(`%${search}%`);
      }
      query += " ORDER BY id ASC";
      const { rows } = await db.query(query, values);
      res.json(rows);
    } else {
      let members = db.sheetsData.members;
      if (search) {
        members = members.filter(
          m => m.name.toLowerCase().includes(search.toLowerCase()) ||
               (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
        );
      }
      res.json(members);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Admin: Update member
exports.updateMember = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (db.type === "POSTGRES") {
      const setClause = Object.keys(updates).map((key,i)=>`${key}=$${i+1}`).join(", ");
      const values = Object.values(updates);
      values.push(id);
      const { rows } = await db.query(`UPDATE members SET ${setClause} WHERE id=$${values.length} RETURNING *`, values);
      if (!rows.length) return res.status(404).json({ message: "Member not found" });
      res.json({ message: "Member updated", member: rows[0] });
    } else {
      const member = db.sheetsData.members.find(m => m.id == id);
      if (!member) return res.status(404).json({ message: "Member not found" });
      Object.assign(member, updates);
      res.json({ message: "Member updated", member });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Public: Get active members (publicly viewable)
// controllers/memberController.js
exports.getPublicMembers = async (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || "";
    let rows;

    if (db.type === "POSTGRES") {
      const { rows: dbRows } = await db.query(
        "SELECT member_id, name, district, profile_pic FROM members WHERE status='ACTIVE'"
      );
      rows = dbRows;
    } else {
      rows = db.sheetsData.members
        .filter(m => m.status === "ACTIVE")
        .map(m => ({
          member_id: m.member_id,
          name: m.name,
          district: m.district,
          profile_pic: m.profile_pic
        }));
    }

    if (search) {
      rows = rows.filter(
        m => m.name.toLowerCase().includes(search) || m.member_id.toLowerCase().includes(search)
      );
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};
