const pool = require("../../database");

const apply = async (req, res) => {
  try {
    const applied = await pool.query(
      "INSERT INTO apply(id,post_id,user_id,applied,status,time,answers,resume) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        `${req.body.post_id}@${req.body.user_id}`,
        req.body.post_id,
        req.body.user_id,
        req.body.apply_date,
        "waiting",
        req.body.time,
        req.body.answers,
        req.body.resume,
      ]
    );
    const o = await pool.query(
      "UPDATE posts SET applied=applied+1 WHERE post_id=$1",
      [req.body.post_id]
    );
    res.json("applied");
  } catch (e) {
    console.log(e);
    throw new Error("Server error");
  }
};

const appliedList = async (req, res) => {
  try {
    const post = await pool.query(
      "SELECT user_id from posts WHERE post_id = $1",
      [req.params.id]
    );
    if (post.rows[0].user_id != req.body.user.id) res.sendStatus(401);
    else {
      const list = await pool.query(
        "Select user_id,status,time FROM apply WHERE post_id=$1 AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
        [req.params.id, req.body.upperLimit, req.body.lowerLimit]
      );
      res.json(list.rows);
    }
  } catch (e) {
    throw new Error("Server Error!");
  }
};

const assign = async (req, res) => {
  try {
    const post = await pool.query(
      "SELECT user_id from posts WHERE post_id=$1",
      [req.body.post_id]
    );
    if (post.rows[0].user_id == req.body.user.id) {
      const o = await pool.query("UPDATE apply SET status=$1 WHERE id=$2", [
        "assigned",
        `${req.body.post_id}@${req.body.user_id}`,
      ]);
      res.json("Assigned");
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    throw new Error("Server error!");
  }
};

const reject = async (req, res) => {
  try {
    const post = await pool.query(
      "SELECT user_id from posts WHERE post_id=$1",
      [req.body.post_id]
    );
    if (post.rows[0].user_id == req.body.user.id) {
      const o = await pool.query("UPDATE apply SET status=$1 WHERE id=$2", [
        "rejected",
        `${req.body.post_id}@${req.body.user_id}`,
      ]);
      res.json("Rejected");
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    throw new Error("Server error!");
  }
};

module.exports = {
  apply,
  appliedList,
  assign,
  reject,
};
