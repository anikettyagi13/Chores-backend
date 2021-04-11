const pool = require("../database");

const updateUserInfo = async (req, res) => {
  try {
    const update = await pool.query(
      "UPDATE userInfo SET username=$1, profile_pic=$2, name=$3, pincodes=$5 RETURNING *",
      [
        req.body.username,
        req.body.profile_pic,
        req.body.name,
        req.body.pincodes,
      ]
    );
    res.json("Updated");
  } catch (e) {
    throw new Error(e.message);
  }
};
