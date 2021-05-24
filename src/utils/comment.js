const pool = require("../../database");

async function addComment(req, res) {
  try {
    var comment = await pool.query(
      "INSERT INTO comments(post_id,comment_id,user_id,likes,comment,username,profile_pic,time) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        req.body.post_id,
        req.body.comment_id,
        req.body.user_id,
        req.body.likes,
        req.body.comment,
        req.body.username,
        req.body.profile_pic,
        req.body.time,
      ]
    );
    await pool.query("UPDATE posts SET comments=comments+1 WHERE post_id=$1", [
      req.body.post_id,
    ]);
    return res.json("Created");
  } catch (e) {
    console.log(e);
    return res.json("Error: Cannot add Comment! We are looking at it. :(");
  }
}

async function getComments(req, res) {
  try {
    const comments = await pool.query(
      "SELECT * from comments where post_id=$1  AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
      [req.body.post_id, req.body.upperLimit, req.body.lowerLimit]
    );

    for (var i of comments.rows) {
      var like = await pool.query("SELECT * from commentLikes WHERE id=$1", [
        `${i.comment_id}-${req.body.user.id}`,
      ]);
      i.liked = false;
      if (like.rows.length > 0) {
        i.liked = true;
      }
    }
    return res.json(comments.rows);
  } catch (e) {
    console.log(e);
    throw new Error("server error");
  }
}

async function likeComment(req, res) {
  try {
    const comments = await pool.query(
      "INSERT INTO commentLikes(id) VALUES($1)",
      [`${req.body.comment_id}-${req.body.user.id}`]
    );
    const inc = await pool.query(
      "UPDATE comments SET likes=likes+1 WHERE comment_id=$1",
      [req.body.comment_id]
    );
    return res.json("Liked");
  } catch (e) {
    return res.status(400).json(`Error: ${e.hint}`);
  }
}

async function dislikeComment(req, res) {
  try {
    const comments = await pool.query("DELETE FROM commentLikes WHERE id=$1", [
      `${req.body.comment_id}-${req.body.user.id}`,
    ]);
    const inc = await pool.query(
      "UPDATE comments SET likes=likes-1 WHERE comment_id=$1",
      [req.body.comment_id]
    );
    return res.json("DisLiked");
  } catch (e) {
    return res.status(400).json(`Error: ${e.hint}`);
  }
}

module.exports = {
  getComments,
  likeComment,
  dislikeComment,
  addComment,
};
