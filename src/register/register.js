const pool = require("../../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { CreateSalt } = require("../utils/utils");

const register = async (id, name, email, password, res) => {
  var user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  var u = await pool.query("SELECT * FROM users WHERE username=$1", [name]);
  if (user.rows.length >= 1) {
    return res.json({
      username: "",
      id: id,
      token: "",
      error: "user already present",
    });
  } else if (u.rows.length >= 1) {
    return res.json({
      username: "",
      id: id,
      token: "",
      error: "Username already taken",
    });
  } else {
    const salt = CreateSalt(10);
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return res.json({
          username: "",
          id: id,
          token: "",
          error: "Sorry, We could not create user try after some time.",
        });
      } else {
        jwt.sign(
          { password: password },
          "$2a$10$.35wejE4Ovk69/8BmljGHO",
          async function (err, token) {
            if (err) {
              return res.json({
                id: id,
                username: "",
                token: "",
                error: "Sorry, We could not create user try after some time.",
              });
            } else {
              try {
                pool
                  .query(
                    "INSERT INTO users(id,username,email,hash,salt,token) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
                    [id, name, email, hash, salt, [token]]
                  )
                  .then((response, err) => {
                    if (err) throw new Error("asdf");
                    return res.json({
                      id: id,
                      token: token,
                      username: name,
                      error: "",
                    });
                  })
                  .catch((e) => {
                    return res.json({
                      id: id,
                      token: "",
                      username: "",
                      error:
                        "Sorry, We could not create user try after some time.",
                    });
                  });
              } catch (e) {
                return res.json({
                  id: id,
                  token: "",
                  name: "",
                  error: "Sorry, We could not create user try after some time.",
                });
              }
            }
          }
        );
      }
    });
  }
};

module.exports = register;
