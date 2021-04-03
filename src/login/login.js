const bcrypt = require("bcryptjs")
const pool = require("../../database")
const jwt =require("jsonwebtoken")

const login = async(email,password,res)=>{
    const user = await pool.query("SELECT * FROM users WHERE email=$1",[email])
    console.log(user.rows)
    if(user.rows.length==0){
        return res.json({
            name:'',
            id:"2e86d4ac-39de-440f-aec5-4f55b556d5abn",
            token:'',
            error:'No user with these credentials found.'
        })

    }else{
        bcrypt.hash(password,user.rows[0].salt,(err,hash)=>{
            if(err){
                return res.json({
                    name:'',
                    id:"2e86d4ac-39de-440f-aec5-4f55b556d5ab",
                    token:'',
                    error:'We are not able to log you in, please try again later..'
                })
            }else{
                if(hash==user.rows[0].hash){
                    console.log("jihaikjdsdlnasjdn.asjdansm")
                    jwt.sign({ password:password }, "$2a$10$.35wejE4Ovk69/8BmljGHO", async function(err, token) {
                        if(err){
                            return res.json({
                                id:"2e86d4ac-39de-440f-aec5-4f55b556d5ab",
                                    name:'',
                                    token:'',
                                error:'Sorry, We could not log you in, try after some time.'
                            })
                        }else{
                            try{
                                const tok = [...user.rows[0].token,token]
                                pool.query("UPDATE users SET token = $1 WHERE email =$2 ",
                                [tok,email])
                                .then((response,err)=>{
                                    if(err) throw new Error("asdf")
                                    console.log("jihaikjdsdlnasjdn.asjdansm")
                                    return res.json({
                                        id:user.rows[0].id,
                                        token:token,
                                        name:user.rows[0].name,
                                        error:''
                                    })
                                })
                            }catch(e){
                                return res.json({
                                    id:"2e86d4ac-39de-440f-aec5-4f55b556d5ab",
                                    token:'',
                                    name:'',
                                    error:'Sorry, We could not log you in, try after some time.'
                                })
                            }
                        }
                      });
                }else{
                    res.json({
                        id:'2e86d4ac-39de-440f-aec5-4f55b556d5ab',
                        token:'',
                        name:'',
                        error:'Incorrect Password'
                    })
                }
            }
        })
    }

}




module.exports =login