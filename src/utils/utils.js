const bcrypt = require("bcryptjs");
const pool = require("../../database");

const CreateSalt = (length) => {
  return bcrypt.genSaltSync(length);
};

const isLoggedIn = async (req, res, next) => {
  try {
    const tokens = req.headers.token;
    const token = tokens.split(" id ")[0];
    const id = tokens.split(" id ")[1];
    var k = 0;
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (user.rows.length > 0) {
      try {
        user.rows[0].token.map((to) => {
          if (to == token) {
            k = 1;
          }
        });
        if (k == 1) {
          req.body.user = user.rows[0];
          const u = await pool.query(
            "SELECT * FROM userInfo WHERE user_id=$1",
            [id]
          );
          req.body.userInfo = u.rows[0];
          req.body.error = "";
          if (u.rows.length == 0) req.body.error = "first time login";
          next();
        } else {
          req.body.error = "unauthorized";
          next();
        }
      } catch (e) {
        req.body.error = "unauthorized";
        next();
      }
    } else {
      req.body.error = "Cannot Retrieve user";
      next();
    }
  } catch (e) {
    res.sendStatus(401);
  }
};

const getAnswers = async (req, res) => {
  try {
    const ok = await pool.query("SELECT answers from apply where id=$1", [
      `${req.params.id}@${req.body.user.id}`,
    ]);
    res.json(ok.rows[0].answers);
  } catch (e) {
    throw new Error("server error!");
  }
};

const getAnswersOfUser = async (req, res) => {
  try {
    const p = await pool.query("SELECT user_id from posts WHERE post_id=$1", [
      req.params.id,
    ]);
    if (p.rows[0].user_id == req.body.user.id) {
      const o = await pool.query("SELECT answers from apply WHERE id=$1", [
        `${req.params.id}@${req.params.user}`,
      ]);
      res.json(o.rows[0].answers);
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    throw new Error("server error");
  }
};

module.exports = {
  CreateSalt,
  isLoggedIn,
  getAnswers,
  getAnswersOfUser,
};
