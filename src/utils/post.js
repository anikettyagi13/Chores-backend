const pool = require("../../database");

const addPost = async (req, res) => {
  try {
    const {
      user_id,
      post_id,
      info,
      likes,
      comments,
      username,
      url,
      state,
      address,
      pincode,
      price_tag,
      profile_pic,
      time,
      resume,
      questions,
      tag1,
      tag2,
      tag3,
      tag4,
      tag5,
    } = req.body;
    const post = await pool.query(
      "INSERT INTO posts(user_id,post_id,info,likes,comments,username,url,state,address,pincode,price_tag,profile_pic,time,applied,resume,questions,tag1,tag2,tag3,tag4,tag5) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *",
      [
        user_id,
        post_id,
        info,
        likes,
        comments,
        username,
        url,
        state,
        address,
        pincode,
        price_tag,
        profile_pic,
        time,
        0,
        resume,
        questions,
        tag1,
        tag2,
        tag3,
        tag4,
        tag5,
      ]
    );
    res.json("uploaded");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

const getGlobal = async (req, res) => {
  try {
    const post = await pool.query(
      "SELECT * FROM posts WHERE address=$1 AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
      ["GLOBAL", req.body.upperLimit, req.body.lowerLimit]
    );
    post.rows.map((r) => {
      r.status = "false";
      r.liked = false;
    });
    res.json(post.rows);
  } catch (e) {
    console.log(e);
    throw new Error("server error");
  }
};

const getIfLiked = async (req, res) => {
  try {
    const liked = await pool.query("SELECT * FROM postLikes WHERE id=$1", [
      `${req.params.id}-${req.body.user.id}`,
    ]);
    if (liked.rows.length > 0) {
      res.json("true");
    } else {
      res.json("false");
    }
  } catch (e) {
    console.log(e);
    throw new Error("server Error");
  }
};

module.exports = {
  addPost,
  getGlobal,
  getIfLiked,
};
