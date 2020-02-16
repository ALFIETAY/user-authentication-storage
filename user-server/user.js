const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
let SALT = 15

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: 1,
        trim: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    name:{
        type: String,
        required: true
    },
    nric:{
        type: String,
        required: true
    },
    nationality:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    gender:{
        type: String,
        required: true,
        enum: ['Male', 'Female'],
    },
    maritalStatus:{
        type: String,
        required: true,
        enum: ['Single', 'Married', 'Widowed', 'Divorced']
    },
    phoneNo:{
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    residentialStatus:{
        type: String,
        required: true
    }
});

//Hashing password before saving to database
userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT, function(err,salt){
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

//Compare password to check it match with database
userSchema.methods.comparePassword = function(candidatePassword, checkpassword){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) return checkpassword(err)
        checkpassword(null, isMatch)
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }