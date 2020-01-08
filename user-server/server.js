const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer  = require('multer');
const app = express();
var fs = require('fs');

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
app.post('/api/user/register', (req, res)=>{
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
                res.status(400).send({'res':err})
                return;
            } 
            res.status(200).send({'res':'You have Successfully Signed up'})
        })
})

//Login to access client application
app.post('/api/user/login', (req, res)=>{

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
            res.status(200).send({'res':'You have Successfully Logged in'})
        })
    })
})

app.get('/api/user/data/:id', (req, res)=>{
    var id = req.params.id
    User.findOne({ username: id }, function (err, results) {
        if (err) return console.error(err)
        try {
            res.status(200).send(results)
        } catch (error) {
            console.log("errror getting results")
            res.status(400).send(err)}
    });
})

//Get pdf document from local dir
app.get('/api/:filename', function(req, res){
    var dir = './pdf-docs/'
    var tempFile= dir + req.params.filename + '.pdf';
    fs.readFile(tempFile, function (err,data){
       res.contentType("application/pdf");
       res.send(data);
       if (err) {
        console.log("Error");
        console.log(err);
        } else {
            console.log("Success");
        }
    });
});

const uploadImage = async (req, res, next) => {
 
    try {
 
        // to declare some path to store your converted image
        const path = '../python-server/'+Date.now()+'.png'
        
        const imgdata = req.body.base64image;

        // to convert base64 format into random filename
        const base64Data = imgdata.replace(/^data:image\/png;base64,/, "");
        
        fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
 
        return res.send(path);
 
    } catch (e) {
        next(e);
    }
}
 
//Upload image api
app.post('/api/image', uploadImage)

const port = process.env.PORT || 4000;

app.listen(port, ()=> {
    console.log('Server is running on ' + port)
})