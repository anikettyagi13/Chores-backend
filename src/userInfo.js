const pool = require("../database");

const updateUserInfo = async (req, res) => {
  try {
    const update = await pool.query(
      "UPDATE userInfo SET username=$1, profile_pic=$2, name=$3, pincodes=$4, bio=$5, website=$6, resume=$7 where user_id=$8",
      [
        req.body.username,
        req.body.profile_pic,
        req.body.name,
        req.body.pincodes,
        req.body.bio,
        req.body.website,
        req.body.resume,
        req.body.user.id,
      ]
    );
    res.json("Updated");
  } catch (e) {
    throw new Error(e.message);
  }
};

const CreateNewUser = async (req, res) => {
  try {
    const user = await pool.query(
      "INSERT INTO userInfo(user_id,username,profile_pic,name,ratings,pincodes,jobs_created,bio,website,jobs_completed,resume) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
      [
        req.body.user_id,
        req.body.username,
        req.body.profile_pic,
        req.body.name,
        0,
        req.body.pincodes,
        0,
        req.body.bio,
        req.body.website,
        0,
        req.body.resume,
      ]
    );
    return;
  } catch (e) {
    console.log(e);
    throw new Error("server");
  }
};

const basicUserInfo = async (req, res) => {
  try {
    const info = await pool.query(
      "SELECT user_id,username,profile_pic from userInfo WHERE user_id=$1",
      [req.params.id]
    );
    res.json(info.rows[0]);
  } catch (e) {
    console.log(e);
    throw new Error("Server Error");
  }
};

module.exports = {
  updateUserInfo,
  CreateNewUser,
  basicUserInfo,
};
