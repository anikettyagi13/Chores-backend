const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const pool = require('./database.js')
const register = require("./src/register/register")

const {isLoggedIn} = require("./src/utils/utils")
const login = require("./src/login/login.js")
const { getComments,likeComment, dislikeComment, addComment } = require("./src/utils/comment.js")

const app =express()

app.use(bodyParser.urlencoded({ extended: true,limit:'50mb' }))
app.use(bodyParser.json({limit: "50mb"}))

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

app.get("/checkLoggedIn",isLoggedIn,async(req,res)=>{
    console.log(req.body)
    if(req.body.error.length>0){
        return res.json(req.body.error)
    }
    res.json("loggedIN")
})

app.post("/login",async(req,res)=>{
    const {email,password} = req.body
    login(email,password,res)
})

app.get("/home",isLoggedIn,(req,res)=>{
    res.json("loggedIN")
})

app.post("/userInfo",isLoggedIn,async(req,res)=>{
    try{
        if(req.body.error.length>0 && req.body.error!= "first time login"){
            throw new Error(req.body.error)
        }
        console.log(req.body)
        const {user_id,name,username,profile_pic,pincodes,ratings,jobs_completed,jobs_created} = req.body
        var userInfo = await pool.query("INSERT INTO userInfo(user_id,name,username,pincodes,profile_pic,jobs_created,ratings,jobs_completed) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",[
            user_id,
            name,
            username,
            pincodes,
            profile_pic,
            jobs_created,
            ratings,
            jobs_completed
        ])
        return res.json({
            username:username,
            profile_pic:profile_pic,
            pincodes,
            name,
            error:''
        })
    }catch(e){
        console.log(e)
        return res.json({
            username:"",
            name:"",
            pincodes:["a"],
            profile_pic:'',
            error:"Error"
        })
    }
    
})

app.get("/getUserInfo",isLoggedIn,async(req,res)=>{
    if(req.body.error){
        return res.json({username:'',name:'',user_id:'',pincodes:["s"],jobs_completed:0,jobs_created:0,ratings:0.0,profile_pic:'',error:req.body.error})
    }
    var userInfo = await pool.query("SELECT * FROM userInfo WHERE user_id=$1",[req.body.user.id])
    res.json({...userInfo.rows[0],error:''})
})


app.post("/getPosts",isLoggedIn,async(req,res)=>{
    if(req.body.error){
        console.log("yoo")
    }else{
        console.log(req.body,"hiiii")
        var posts = await pool.query("SELECT * from posts WHERE (pincode=$1 OR pincode=$2 OR pincode=$3) AND (time>$4 OR time<$5) ORDER BY time DESC limit 9",[
            req.body.userInfo.pincodes[0],
            req.body.userInfo.pincodes[1],
            req.body.userInfo.pincodes[2],
            req.body.upperLimit,
            req.body.lowerLimit
        ])
        for(var i of posts.rows){
            var like  = await pool.query("SELECT * from postLikes WHERE(id=$1)",[
                `${i.post_id}-${req.body.user.id}`
            ])
            i.liked=false
            if(like.rows.length>0){
                i.liked=true
            }
        }
        res.json(posts.rows)
    }
})

app.post("/likePost",isLoggedIn,async(req,res)=>{
    if(req.body.error){
        return res.json(`Error: ${req.body.error}`)
    }else{
        try{
            var id = `${req.body.post_id}-${req.body.user_id}`
            var like = await pool.query("INSERT INTO postLikes(id, username, profile_pic, user_id, post_id) VALUES($1,$2,$3,$4,$5)",[
                id,
                req.body.username,
                req.body.profile_pic,
                req.body.user_id,
                req.body.post_id
            ])
            var post = await pool.query("UPDATE posts SET likes=likes+1 WHERE post_id=$1",[
                req.body.post_id
            ])
            res.json("Liked")
        }catch(e){
            console.log(e)
            res.json("Error: Unable to Like!")
        }
    }
})

app.post("/dislikePost",isLoggedIn,async(req,res)=>{
    if(req.body.error){
        return res.json(`Error: ${req.body.error}`)
    }else{
        try{
            var id = `${req.body.post_id}-${req.body.user_id}`
            var like = await pool.query("DELETE FROM postLikes WHERE id = $1",[
                id,
            ])
            var post = await pool.query("UPDATE posts SET likes=likes-1 WHERE post_id=$1",[
                req.body.post_id
            ])
            res.json("disliked")
        }catch(e){
            res.json("Error: Unable to dislike!")
        }
    }
})

// Comment routes
app.post("/addComment",isLoggedIn,async(req,res)=>{
    if(!req.body.error){
        await addComment(req,res)
    }else{
        res.json("Error: Cannot add Comment! We are looking at it. :(")
    }
})

app.post("/getComments",isLoggedIn,async(req,res)=>{
    if(!req.body.error){
        await getComments(req,res)
    }else{
        return res.json("Error: Cannot load comments",401)
    }
})

app.post("/likeComment",isLoggedIn,async(req,res)=>{
    if(!req.body.error){
        await likeComment(req,res)
    }else{
        console.log(req.body.error)
        return res.status(401).json(`Error: Cannot like comment`)
    }
})

app.post("/dislikeComment",isLoggedIn,async(req,res)=>{
    if(!req.body.error){
        dislikeComment(req,res)
    }else{
        return res.status(401).json("Error: Cannot dislike Comment")
    }
})

app.post("/AddPost",isLoggedIn,async(req,res)=>{
    if(!req.body.error){
        try{
            const { user_id,post_id,info,likes,comments,username,url,state,address,pincode,price_tag,profile_pic,created,time } = req.body
            const post = await pool.query("INSERT INTO posts(user_id,post_id,info,likes,comments,username,url,state,address,pincode,price_tag,profile_pic,created,time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",[
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
                created,
                time
            ])
            res.json("uploaded")
        }catch(e){
            console.log(e)
            res.json("Error: Not uploaded")
        }
    }else{
        if(req.body.error == "unauthorized"){
            res.json("Error: Unauthorized")
        }
    }
    
    
})

app.listen(3000,()=>{
    console.log("SERVER listening on port 3000")
})