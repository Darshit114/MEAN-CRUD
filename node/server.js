const express = require('express');
const bodyParser= require('body-parser')
//const monggose = require('mongoose');
const mongojs = require('mongojs');
const cors = require('cors');
const app = express()
 
const multer = require('multer');
const path = require('path');
 
const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,'uploads/');
    },
    filename : (re,file,cb)=>{

        cb(null,Date.now()+path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage});

const { validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbname = "student";
const collection = ['student'];
var ObjectId = require('mongodb').ObjectID;

//monggose.connect("mongodb://localhost/demo",{ useNewUrlParser: true, useUnifiedTopology: true  });

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

var db = mongojs(dbname, collection);

// const PersonModel = monggose.model("person", {
//     firstname: String,
//     lastname: String
// });


///var id = 0;

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/register.html');
});


app.post("/addStud",upload.single('file'),async(req,res)=>{

    // try {
    //     var person = new PersonModel(req.body);
    //     var result = await person.save();
    //     res.send(result);

    // } catch (error) {
    //     res.status(500).send(error);
    // }

    //id = id + 1;

    
    //validation

    
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
       
            errors: errors.array()

        });
    }

   
    

    // if(req.file) {
        
    //     var img = req.file;
    // }
    // else throw 'error';

    let { username,email,branch,password } = req.body;
   
    
    

    
    try{

        
        
        await db.student.findOne({ email },async(err,msg)=>{
           
            if(err){
                console.log(err);
                
            }else{
                
                var user = msg;
               
            }

            var usr = user;
            //return usr;
       
            if (usr) {
                
                return res.status(400).json({
                    msg: "User Already Exists"
                });
               
                
            } else{

                const salt = await bcrypt.genSalt(10);
                password = await bcrypt.hash(password, salt);

                 

                    db.student.save({
                        username: username,
                        email: email,
                        password: password,
                        branch : branch,
                        img: req.file
                        
                    },(err,msg)=>{
                        if(err){
                            console.log(err);
                            
                        }else{
                            //console.log(msg);
                            //res.send(msg);


                            var payload = {
                                user: {
                                    id: msg._id
                                }
                            };

                        
                            jwt.sign(
                                payload,
                                "randomString", {
                                    expiresIn: 10000
                                },
                                (err, token) => {
                                    if (err) throw err;
                                    res.status(200).json({
                                        token
                                    });
                                }
                            );
        
        
                            
                        }
                    });


            }
           
        });     

    }catch{

        //console.log(err);
        res.status(500).send("Error in Saving");

    }


    // db.student.save({
    //     name: req.body.name,
    //     password: req.body.pswd
    // })
    // res.status(200).send({
    //     "message": "data received"
    // });

});


app.post('/loginStud',async(req,res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    let { email, password } = req.body;

    try{

        await db.student.findOne({ email },async(err,msg)=>{
           
            if(err){
                console.log(err);
                
            }else{
                //console.log(msg);
                var user = msg;
               
            }

            var usr = user;

            if (!usr)
                return res.status(400).json({
                message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });
            
            const payload = {
                user: {
                    id: usr._id
                }
            };

            
            jwt.sign(
                payload,
                "secret",
                {
                  expiresIn: 3600
                },
                (err, token) => {
                  if (err) throw err;
                  res.status(200).json({
                    token
                  });
                }
            );
            

        });

    }catch(e){

        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });

    }

});



app.get("/",async(req,res)=>{

    //res.sendFile(__dirname + '/index.html');'
    res.send("Sever working perfectly!!!");
});

app.get("/getAllStud",async(req,res)=>{

    // try {
    //     var result = await PersonModel.find().exec();
    //     res.send(result);
    // } catch (error) {
    //     res.status(500).send(error);
    // }

    db.student.find({},function(err,msg){
        if(err){
            console.log(err);
        }else{
            
            res.send(msg);
            res.end();
        }

    });
    //console.log(data);

});

app.get("/getOnestud/:id",async(req,res)=>{

    // try {
    //     var person = await PersonModel.findById(req.params.id).exec();
    //     res.send(person);
    // } catch (error) {
    //     res.status(500).send(error);
    // }


    let id = req.params.id;

    db.student.findOne({ _id : ObjectId(id)},function(err,msg){
        if(err){
            console.log(err);
            
        }else{
            res.send(msg);
            res.end();
            
        }

    });


    

});

app.get("/getLastStud",(req,res)=>{
    

    db.student.find().sort( { "_id" : -1 } ).limit(1).toArray(function(err,msg){
        if(err){
            console.log(err);
            
        }else{
          
            res.send(msg);
        }
        
    });
    

});

app.put("/updateStud/:id",upload.single('file'),async(req,res)=>{

    // try {
    //     var person = await PersonModel.findById(req.params.id).exec();
    //     person.set(req.body);
    //     var result = await person.save();
    //     res.send(result);
    // } catch (error) {
    //     res.status(500).send(error);
    // }

    let id = req.params.id;
    
    
    
    db.student.updateOne({ _id : ObjectId(id)},{ 
        $set : {

            "username" : req.body.username,
            "email" : req.body.email,
            "password" : req.body.password,
            "branch" : req.body.branch,
            "img" : req.file
               

        } },(err,msg)=>{

            if(err){
                console.log(err);
                
            }else{
                console.log(msg);
                res.end();
                
            }

        });

});

app.delete("/deleteStud/:id",async(req,res)=>{

    // try {
    //     var result = await PersonModel.deleteOne({ _id: req.params.id }).exec();
    //     res.send(result);
    // } catch (error) {
    //     res.status(500).send(error);
    // }

    
    let id = req.params.id;

    console.log("delete called!!!");
    

    db.student.remove({ _id: ObjectId(id) },(err,msg)=>{

        if(err){
            console.log(err);
            
        }else{
            // console.log("Successfully deleted!!!");
            res.sendStatus(200);
        }

    });

    
});

app.get('/img/:id',async (req,res)=>{

    let id = req.params.id;

    db.student.findOne({ _id : ObjectId(id)},function(err,msg){
        if(err){
            console.log(err);
            
        }else{
            

            // console.log(msg.img);

            require('fs').readFile(__dirname+'/'+msg.img.path, function (err, content) {
                if (err) {
                    res.writeHead(400, {'Content-type':'text/html'})
                    console.log(err);
                    res.send("No such image");    
                } else {
                    //specify the content type in the response will be an image
                    //res.writeHead(200,{'Content-type':'image/jpg'});
                    res.send(content);
                }
            });
            
            
        }

    });
    

    // require('fs').readFile(__dirname+'/uploads/1586088005311.jpg', function (err, content) {
    //     if (err) {
    //         res.writeHead(400, {'Content-type':'text/html'})
    //         console.log(err);
    //         res.send("No such image");    
    //     } else {
    //         //specify the content type in the response will be an image
    //         //res.writeHead(200,{'Content-type':'image/jpg'});
    //         res.send(content);
    //     }
    // });

});

app.put('/imgDelete',(req,res)=>{

    require('fs').unlink(__dirname + "/" + req.body.img.path, function(err, msg) {
        if (err) {
            console.log(err);
        } else {
            res.send("file deleted successfully");
            res.end();
        }
    });

});

app.listen(3000,()=>{
    console.log("Server started at 3000.");
});