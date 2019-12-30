const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

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

app.use(bodyParser.json()); //Converts data to JSON format

//Post user data to database
app.get('/api/user/register', (req, res)=>{
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
        if(!user) res.json({message: 'Login failed, user not found'})

        //if user found it will compare password
        user.comparePassword(req.body.password, (err, isMatch)=>{
            if(err) throw err;
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

const port = process.env.PORT || 4000;

app.listen(port, ()=> {
    console.log('Server is running on ' + port)
})