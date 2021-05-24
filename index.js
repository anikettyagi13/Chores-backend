const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("./database.js");
const register = require("./src/register/register");
const {
  updateUserInfo,
  CreateNewUser,
  basicUserInfo,
} = require("./src/userInfo");

const {
  appliedList,
  assign,
  reject,
  apply,
} = require("./src/utils/applyUtils");

const {
  isLoggedIn,
  getAnswers,
  getAnswersOfUser,
} = require("./src/utils/utils");
const login = require("./src/login/login.js");
const {
  getComments,
  likeComment,
  dislikeComment,
  addComment,
} = require("./src/utils/comment.js");
const {
  notify,
  notifications,
  getCounts,
} = require("./src/utils/notification.js");
const { addPost, getGlobal, getIfLiked } = require("./src/utils/post");

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.get("/users", async (req, res) => {
  const users = await pool.query("SELECT * FROM users");
  res.json({ users: users.rows });
});

app.post("/delete-user", async (req, res) => {
  const user = await pool.query(req.body.query);
  res.json({ user });
});

app.post("/register", async (req, res) => {
  const { id, name, email, password } = req.body;
  await register(id, name, email, password, res);
});

app.get("/checkLoggedIn", isLoggedIn, async (req, res) => {
  if (req.body.error.length > 0) {
    return res.json(req.body.error);
  }
  res.json("loggedIN");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  login(email, password, res);
});

app.get("/home", isLoggedIn, (req, res) => {
  res.json("loggedIN");
});

app.put("/userInfo", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error === "unauthorized") {
      res.sendStatus(401).json("unauthorized");
    }
    await updateUserInfo(req, res);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/userInfo", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error.length > 0 && req.body.error != "first time login") {
      throw new Error(req.body.error);
    }
    const {
      user_id,
      name,
      username,
      profile_pic,
      pincodes,
      ratings,
      jobs_completed,
      jobs_created,
      resume,
    } = req.body;
    await CreateNewUser(req, res);
    return res.json({
      username: username,
      profile_pic: profile_pic,
      pincodes,
      name,
      error: "",
    });
  } catch (e) {
    return res.sendStatus(500);
  }
});

app.get("/getUserInfo/:id", async (req, res) => {
  try {
    if (req.body.error) {
      res.sendStatus(404);
    } else {
      var userInfo = await pool.query(
        "SELECT * FROM userInfo WHERE user_id=$1",
        [req.params.id]
      );
      res.json(userInfo.rows[0]);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/getUserInfo", isLoggedIn, async (req, res) => {
  if (req.body.error) {
    return res.json({
      username: "",
      name: "",
      user_id: "",
      pincodes: ["s"],
      jobs_completed: 0,
      jobs_created: 0,
      ratings: 0.0,
      profile_pic: "",
      error: req.body.error,
    });
  }
  var userInfo = await pool.query("SELECT * FROM userInfo WHERE user_id=$1", [
    req.body.user.id,
  ]);
  res.json({ ...userInfo.rows[0], error: "" });
});

app.get("/getAnswers/:id", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) {
      res.sendStatus(401);
    } else {
      await getAnswers(req, res);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/getAnswersOfUser/:id/:user", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else {
      await getAnswersOfUser(req, res);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/getPosts", isLoggedIn, async (req, res) => {
  if (req.body.error) {
    // TODO fmkas ##########################################################################################
  } else {
    var posts = await pool.query(
      "SELECT * from posts WHERE (pincode=$1 OR pincode=$2 OR pincode=$3) AND (time>$4 OR time<$5) ORDER BY time DESC limit 9",
      [
        req.body.userInfo.pincodes[0],
        req.body.userInfo.pincodes[1],
        req.body.userInfo.pincodes[2],
        req.body.upperLimit,
        req.body.lowerLimit,
      ]
    );
    for (var i of posts.rows) {
      var like = await pool.query("SELECT * from postLikes WHERE(id=$1)", [
        `${i.post_id}-${req.body.user.id}`,
      ]);
      var assign = await pool.query(
        "SELECT * from apply WHERE(id=$1) LIMIT 1",
        [`${i.post_id}@${req.body.user.id}`]
      );
      i.status = "false";
      if (assign.rows[0]) {
        i.status = assign.rows[0].status;
      }
      i.liked = false;
      if (like.rows.length > 0) {
        i.liked = true;
      }
    }
    res.json(posts.rows);
  }
});

app.post("/getAppliedList/:id", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else await appliedList(req, res);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/basicUserInfo/:id", async (req, res) => {
  try {
    await basicUserInfo(req, res);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/getUserPosts/:id", async (req, res) => {
  try {
    if (req.body.error) {
      res.status(500).json([]);
    } else {
      var posts = await pool.query(
        "SELECT * from posts WHERE user_id=$1 AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
        [req.params.id, req.body.upperLimit, req.body.lowerLimit]
      );
      for (var i of posts.rows) {
        var like = await pool.query("SELECT * from postLikes WHERE(id=$1)", [
          `${i.post_id}-${req.params.id}`,
        ]);
        i.liked = false;
        if (like.rows.length > 0) {
          i.liked = true;
        }
      }
      res.json(posts.rows);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/apply", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else {
      await apply(req, res);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/assign", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else {
      await assign(req, res);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/reject", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else {
      await reject(req, res);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/notify", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    await notify(req, res);
    res.json("notified");
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/getGlobal", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else await getGlobal(req, res);
  } catch (e) {
    res.sendStatus(500);
  }
});

// app.get("/getStatus/:id",isLoggedIn,async(req,res)=>{
//   try{
//     if(req.body.error) res.sendStatus(401)
//     else await getStatus(req,res)
//   }catch(e){
//     res.sendStatus(500)
//   }
// })

app.get("/getIfLiked/:id", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else getIfLiked(req, res);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/getPostStatus/:id", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else {
      var status = await pool.query("SELECT * from apply WHERE id=$1", [
        `${req.params.id}@${req.body.user.id}`,
      ]);
      if (status.rows.length > 0) res.json(status.rows[0].status);
      else res.json("false");
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/getPost/:id", async (req, res) => {
  try {
    var post = await pool.query("SELECT * from posts WHERE post_id=$1", [
      req.params.id,
    ]);
    res.json(post.rows[0]);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/notifications", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) res.sendStatus(401);
    else await notifications(req, res);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/getCount", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) {
      res.sendStatus(401);
    } else {
      if (req.body.type == "assign") res.json({ count: 0 });
      else {
        var k = await getCounts(req, res);
        if (req.body.type == "like" || req.body.type == "dislike") {
          res.json({ count: k.likes });
        } else if (req.body.type == "apply") {
          res.json({ count: k.applied });
        } else {
          res.json({ count: 0 });
        }
      }
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/getUserPosts", isLoggedIn, async (req, res) => {
  try {
    if (req.body.error) {
      res.sendStatus(401);
    } else {
      var posts = await pool.query(
        "SELECT * from posts WHERE user_id=$1 AND (time>$2 OR time<$3) ORDER BY time DESC limit 9",
        [req.body.user.id, req.body.upperLimit, req.body.lowerLimit]
      );
      for (var i of posts.rows) {
        var like = await pool.query("SELECT * from postLikes WHERE(id=$1)", [
          `${i.post_id}-${req.body.user.id}`,
        ]);
        i.liked = false;
        if (like.rows.length > 0) {
          i.liked = true;
        }
      }
      res.json(posts.rows);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/likePost", isLoggedIn, async (req, res) => {
  if (req.body.error) {
    return res.json(`Error: ${req.body.error}`);
  } else {
    try {
      var id = `${req.body.post_id}-${req.body.user_id}`;
      var like = await pool.query(
        "INSERT INTO postLikes(id, username, profile_pic, user_id, post_id) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          req.body.username,
          req.body.profile_pic,
          req.body.user_id,
          req.body.post_id,
        ]
      );
      var post = await pool.query(
        "UPDATE posts SET likes=likes+1 WHERE post_id=$1",
        [req.body.post_id]
      );
      res.json("Liked");
    } catch (e) {
      res.json("Error: Unable to Like!");
    }
  }
});

app.post("/dislikePost", isLoggedIn, async (req, res) => {
  if (req.body.error) {
    return res.json(`Error: ${req.body.error}`);
  } else {
    try {
      var id = `${req.body.post_id}-${req.body.user_id}`;
      var like = await pool.query("DELETE FROM postLikes WHERE id = $1", [id]);
      var post = await pool.query(
        "UPDATE posts SET likes=likes-1 WHERE post_id=$1",
        [req.body.post_id]
      );
      res.json("disliked");
    } catch (e) {
      res.json("Error: Unable to dislike!");
    }
  }
});

// Comment routes
app.post("/addComment", isLoggedIn, async (req, res) => {
  if (!req.body.error) {
    await addComment(req, res);
  } else {
    res.json("Error: Cannot add Comment! We are looking at it. :(");
  }
});

app.post("/getComments", isLoggedIn, async (req, res) => {
  try {
    if (!req.body.error) {
      await getComments(req, res);
    } else {
      return res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/likeComment", isLoggedIn, async (req, res) => {
  if (!req.body.error) {
    await likeComment(req, res);
  } else {
    return res.status(401).json(`Error: Cannot like comment`);
  }
});

app.post("/dislikeComment", isLoggedIn, async (req, res) => {
  if (!req.body.error) {
    dislikeComment(req, res);
  } else {
    return res.status(401).json("Error: Cannot dislike Comment");
  }
});

app.post("/AddPost", isLoggedIn, async (req, res) => {
  if (!req.body.error) {
    await addPost(req, res);
  } else res.sendStatus(401);
});

app.listen(3000, () => {
  console.log("SERVER listening on port 3000");
});
