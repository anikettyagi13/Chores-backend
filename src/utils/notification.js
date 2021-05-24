const pool = require("../../database");

const notify = async (req, res) => {
  try {
    var noti = await pool.query(
      "SELECT * from notification WHERE(post_id=$1 AND type=$2)",
      [req.body.post_id, req.body.type]
    );
    if (noti.rows.length > 0) {
      noti = await pool.query(
        "UPDATE notification SET time=$1, element=$2, user_id=$3 WHERE post_id=$4 AND type=$5 RETURNING *",
        [
          req.body.time,
          req.body.element,
          req.body.user_id,
          req.body.post_id,
          req.body.type,
        ]
      );
    } else {
      noti = await pool.query(
        "INSERT INTO notification(id,user_id,post_id,type,time,post_pic,data,element) values($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
        [
          req.body.id,
          req.body.user_id,
          req.body.post_id,
          req.body.type,
          req.body.time,
          req.body.post_pic,
          req.body.data,
          req.body.element,
        ]
      );
    }
    return;
  } catch (e) {
    console.log(e);
    throw new Error("Server Error");
  }
};

const notifications = async (req, res) => {
  try {
    const k = await pool.query(
      "SELECT * FROM notification WHERE id=$1 AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
      [req.body.user.id, req.body.upperLimit, req.body.lowerLimit]
    );
    if (k.rows.length > 0) {
      k.rows.map((o) => {
        o.count = 0;
      });
      res.json(k.rows);
    } else {
      res.json([]);
    }
  } catch (e) {
    console.log(e);
    throw new Error("server error");
  }
};

const getCounts = async (req, res) => {
  try {
    const k = await pool.query("SELECT * FROM posts WHERE post_id=$1", [
      req.body.post_id,
    ]);
    return k.rows[0];
  } catch (e) {
    console.log(e);
    throw new Error("server error");
  }
};

module.exports = {
  notify,
  notifications,
  getCounts,
};
