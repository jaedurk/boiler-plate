const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        //비밀번호 암호화 시킨다
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            });
        });
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    //plainPassword 1234567     암호화된 비밀번호 $2b$10$fTDTMHcZOSjWRB1L2CU2r.ZaG7XcQCLd94OqmFEWN1HgmwUiEiLDe
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

userSchema.methods.generateToken = function (cb) {
    let user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    let token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save().then(() => {
        cb(null, user);
    }).catch((err) => {
        if (err) return cb(err);
    });
}

userSchema.statics.findByToken = function (token, cb) {
    let user = this;
    jwt.verify(token, 'secretToken', function (err, decoded) {
        user.findOne({"_id": decoded, "token": token}).then((user) => {
            cb(null, user);
        }).catch((err) => {
            return cb(err);
        });
    });
}

const User = mongoose.model('User', userSchema)

module.exports = {User}