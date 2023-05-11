const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const mysql=require('mysql')
require('dotenv').config()

const PORT=3000

const connection=mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})
connection.connect(err => {
    if (err) throw err 
    console.log('MySQL database connected successfully!')
})

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extende:true}))
app.set("view engine","ejs")

app.get("/",function(req,res){
    res.render("login",{loggedMessage:""})
})
app.get("/end",function(req,res){
    res.redirect("/")
})



app.post("/login",function(req,res){
    const username=req.body.username;
    const password=req.body.password;
    if(req.body.admin){
        if(username===process.env.ADMIN_USERNAME && password===process.env.ADMIN_PASSWORD){
            res.render("admin")
        }else{
            res.render("login",{loggedMessage:"Invalid admin credentials"})
        }
    }else{
        const sqlSearch="SELECT * FROM users where username='"+username+"'";
        connection.query(sqlSearch,function(err,result){
            if(err) throw err;
            if(result.length==0){
                const sqlInsert="INSERT INTO users (username,password) VALUES ('"+username+"','"+password+"')";
                connection.query(sqlInsert,function(err,result){
                    if(err) throw err;
                })
                res.render("instructions",{username:username})
            }else{
                const user=result[0];
                if(user.password===password){
                    res.render("end",{time:user.time,attempts:user.attempts})
                }else{
                    res.render("login",{loggedMessage:"Incorrect password"})
                }
            }
        })
    }
})
app.post("/start",function(req,res){
    const username=req.body.username;
    const date=new Date();
    const sd=('0'+date.getFullYear()).slice(-2)+"-"+('0'+date.getMonth()).slice(-2)+"-"+('0'+date.getDay()).slice(-2)+" "+('0'+date.getHours()).slice(-2)+":"+('0'+date.getMinutes()).slice(-2)+":"+('0'+date.getSeconds()).slice(-2);
    const sql="UPDATE users SET startTime='"+sd+"' WHERE username='"+username+"'";
    connection.query(sql,function(err,result){
        if(err) throw err;
    })
    res.render("q1",{msg:"",username:username})
})
app.post("/task1",function(req,res){
    const ans=req.body.q1_ans;
    const username=req.body.username;
    if(ans.toLowerCase()===process.env.Q1_ANSWER){
        res.render("q2",{msg:"",username:username});
    }else{
        const sql="UPDATE users SET attempts=attempts+1 WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        res.render("q1",{msg:"Incorrect answer",username:username})
    }
})
app.post("/task2",function(req,res){
    const ans=req.body.q2_ans;
    const path=req.body.path;
    const username=req.body.username;
    if(ans.toLowerCase()===process.env.Q2_ANSWER){
        if(path==="left"){
            res.render("lq3",{msg:"",username:username})
        }else{
            res.render("rq3",{msg:"",username:username})
        }
    }else{
        const sql="UPDATE users SET attempts=attempts+1 WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        res.render("q2",{msg:"Incorrect answer",username:username})
    }
})
app.post("/left/task3",function(req,res){
    const ans=req.body.lq3_ans;
    const username=req.body.username;
    if(ans.toLowerCase()===process.env.LQ3_ANSWER){
        res.render("dead",{username:username})
    }else{
        const sql="UPDATE users SET attempts=attempts+1 WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        res.render("lq3",{msg:"Incorrect answer",username:username})
    }
})
app.post("/dead",function(req,res){
    res.render("q2",{msg:"",username:req.body.username});
})
app.post("/right/task3",function(req,res){
    const ans=req.body.rq3_ans;
    const username=req.body.username;
    if(ans.toLowerCase()===process.env.RQ3_ANSWER){
        res.render("rq4",{msg:"",username:username})
    }else{
        const sql="UPDATE users SET attempts=attempts+1 WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        res.render("rq3",{msg:"Incorrect answer",username:username})
    }
})
app.post("/right/task4",function(req,res){
    const ans=req.body.rq4_ans;
    const username=req.body.username;
    if(ans.toLowerCase()===process.env.RQ4_ANSWER){
        const date=new Date();
        const ed=('0'+date.getFullYear()).slice(-2)+"-"+('0'+date.getMonth()).slice(-2)+"-"+('0'+date.getDay()).slice(-2)+" "+('0'+date.getHours()).slice(-2)+":"+('0'+date.getMinutes()).slice(-2)+":"+('0'+date.getSeconds()).slice(-2);
        const sql="UPDATE users SET endTime='"+ed+"' WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        const sql1="UPDATE users SET time=TIMESTAMPDIFF(SECOND,startTime,endTime) WHERE username='"+username+"'";
        connection.query(sql1,function(err,result){
            if(err) throw err;
        })
        const sqlSearch="SELECT * FROM users where username='"+username+"'";
    connection.query(sqlSearch,function(err,result){
        if(err) throw err;
        const user=result[0];
        res.render("end",{time:user.time,attempts:user.attempts})
    })
    }else{
        const sql="UPDATE users SET attempts=attempts+1 WHERE username='"+username+"'";
        connection.query(sql,function(err,result){
            if(err) throw err;
        })
        res.render("rq4",{msg:"Incorrect answer",username:username})
    }
})




app.listen(PORT,function(){
    console.log("Server started at PORT "+PORT);
})