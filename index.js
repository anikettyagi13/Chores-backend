const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const pool = require('./database.js')
const register = require("./src/register/register")

const {CreateSalt, isLoggedIn} = require("./src/utils/utils")
const login = require("./src/login/login.js")

const app =express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.get("/users",async(req,res)=>{
    const users = await pool.query("SELECT * FROM users");
    res.json({users:users.rows})
})

app.post("/delete-user",async(req,res)=>{
    const user = await pool.query(req.body.query)
    res.json({user})
})

app.post("/register",async(req,res)=>{
    const {id,name,email,password} = req.body;
    await register(id,name,email,password,res)
})

app.get("/checkLoggedIn",async(req,res)=>{
    res.json("loggedIN")
})

app.post("/login",async(req,res)=>{
    const {email,password} = req.body
    login(email,password,res)
})

app.get("/home",isLoggedIn,(req,res)=>{
    res.json("loggedIN")
})

app.listen(3000,()=>{
    console.log("SERVER listening on port 3000")
})