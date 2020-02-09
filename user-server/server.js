const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
var _ = require('lodash');
var fs = require('fs');

const { PythonShell } = require('python-shell');

// var envPath = '/home/easeloan/Desktop/backend/python-app/venv/bin/python';
// var dirPath = '/home/easeloan/Desktop/backend/python-app/';
var envPath = 'C:/Users/Alfie/Desktop/backend/python-app/venv/Scripts/python.exe'
var dirPath = 'C:/Users/Alfie/Desktop/backend/python-app'

app.locals.name = "";
app.locals.loanAmount = 0;
app.locals.loanTenure = 0;


let options = {
    mode: 'text',
    pythonPath: envPath,
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: dirPath,
    args: [app.locals.name, app.locals.loanAmount, app.locals.loanTenure]
  };

//Connect to mongoose database
mongoose.connect('mongodb://localhost:27017/client',  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(()=> console.log("Connected to DB"))
.catch(error=>console.log(error));

//Import models
const { User } = require('./user')

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

app.use(bodyParser.json()); //Converts data to JSON format

//Post user data to database
app.post('/register', (req, res)=>{
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            nric: req.body.nric,
            nationality: req.body.nationality,
            age: req.body.age,
            gender: req.body.gender,
            maritalStatus: req.body.maritalStatus,
            phoneNo: req.body.phoneNo,
            email: req.body.email,
            address: req.body.address,
            residentialStatus: req.body.residentialStatus
        }).save((err, response)=>{
            if(err) {
                res.status(400).send({'res':err});
                return;
            } 
            res.status(200).send({'res':'You have Successfully Signed up'});
        })
})

//Update user information
app.put('/update/:id', (req, res)=>{
    //checks that user exists
    User.findById(req.params.id, function(err, post) {
        if (err) return next(err);
        
        _.assign(post, req.body); // update user
        post.save(function(err) {
            if (err) {
                    res.status(400).send({'res':err})
                    return;
                } 
                    return res.status(200).send("Success");
        })
    });
});


//Login to access client application
app.post('/login', (req, res)=>{
    //checks that user exists
    User.findOne({'username': req.body.username}, (err, user)=>{
        if(!user) return res.json({message: 'Login failed, user not found'})
        //if user found it will compare password
        user.comparePassword(req.body.password, (err, isMatch)=>{
            if(err) {
                res.status(400).send({'res':err})
                return;
            } 
            if(!isMatch) return res.status(400).json({
                message:'Incorrect Password'
            });
            res.status(200).send({'res':'You have Successfully Logged in'});
        })
    })
})

//Get user information
app.get('/data/:id', (req, res)=>{
    var id = req.params.id;
    User.findOne({ username: id }, function (err, results) {
        if (err) return console.error(err)
        try {
            res.status(200).send(results);
        } catch (error) {
            console.log("error getting results");
            res.status(400).send(err)};
    });
})

//Get pdf document from local dir
app.get('/:filename', function(req, res){
    var dir = './pdf-docs/';
    var tempFile= dir + req.params.filename + '.pdf';
    fs.readFile(tempFile, function (err,data){
       res.contentType("application/pdf");
       res.send(data);
       if (err) {
            console.log(err);
        } else {
            console.log("Success");
        }
    });
});

const uploadImage = async (req, res, next) => {
 
    try {
 
        // to declare some path to store your converted image
        const path = '../python-app/'+'signature'+'.png';
        
        const imgdata = req.body.base64image;

        // to convert base64 format into random filename
        const base64Data = imgdata.replace(/^data:image\/png;base64,/, "");
        
        fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
 
        // to execute python script
        PythonShell.run('app.py', options, function (err, results) {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            } else {
                console.log(results);
                return res.status(200).send("Success");
            }
        });
 
    } catch (e) {
        next(e);
    }
}
 
//Upload signature to loan contract
app.post('/sign', uploadImage)

const port = process.env.PORT || 4000;

app.listen(port, ()=> {
    console.log('Server is running on ' + port)
})

//Generates loan contract
app.post('/generate', (req, res)=>{
    // set variables
    let contractOptions = {
        mode: 'text',
        pythonPath: envPath,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: dirPath,
        args: [req.body.name, req.body.loanAmount, req.body.loanTenure]
      };
    try {
        // execute python script
        PythonShell.run('contract.py', contractOptions, function (err, results) {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            } else {
                console.log(results);
                return res.status(200).send("Success");
            }
        });
    }
    catch (e) {
        next(e);
    }
})
