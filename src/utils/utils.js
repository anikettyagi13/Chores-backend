const bcrypt = require("bcryptjs")
const pool =require("../../database")

const CreateSalt = (length)=>{
   return bcrypt.genSaltSync(length)
}

const isLoggedIn = async(req,res,next)=>{
    const tokens = req.headers.token
    console.log(tokens,"tokens")
    const token = tokens.split(" id ")[0]
    const id = tokens.split(" id ")[1]
    console.log(token,id,"tokens")

    var k=0;
    const user = await pool.query("SELECT * FROM users WHERE id=$1",[id])
    console.log(user.rows[0].token)
    if(user.rows.length){
        console.log()
        user.rows[0].token.map((to)=>{
            if(to==token){
                k=1
            }
        })
        if(k=1){
            req.body.user = user.rows[0]
            next();
        }
        else{
            res.json({
                error:'unauthorized'
            })
        }
        
    }else{
        res.json({
            error:"Cannot retrieve user"
        })
    }

}

module.exports ={
    CreateSalt,
    isLoggedIn
}