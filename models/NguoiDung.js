var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var md5 = require('md5');

var Schema = mongoose.Schema;


const SecretKey = ":v:3@@._.==:<:D";


// TODO: xử lý Validation ...
var NguoiDungSchema = new Schema(
    {
        Email: { type: String, unique: true, trim: true, required: true, max: 60 },
        MatKhau: { type: String, required: true, max: 32, min: 6 },
        TenHienThi: { type: String, required: true, max: 80 },
        lsTimKiem: [{ type: Schema.Types.ObjectId, ref: "LichSuTimKiem" }],
        HoaDon: [{ type: Schema.Types.ObjectId, ref: "HoaDon" }],
        IsActive: { type: Boolean, default: false },
        Role: {
            type: String,
            enum: ['User', 'Admin'],
            default: 'User'
        },
        Tokens: [{
            Token: { type: String, trim: true, required: true },
            Loai: { type: String, enum: ['QuenMatKhau', 'KichHoat'], required: true },
            Used: { type: Boolean, default: false }
        }]
    },
    { collection: 'NguoiDung' }
);

// Virtual for book's URL
NguoiDungSchema
    .virtual('url')
    .get(function () {
        return '/users/' + this._id;
    });

NguoiDungSchema
    .virtual('IsAdmin')
    .get(function () {
        return this.Role === 'Admin';
    });


function createToken(user) {
    var now = new Date();
    return md5(user._id.toHexString() + user.Email + SecretKey + now.getTime());
}


NguoiDungSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('MatKhau')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.MatKhau, salt, (err, hash) => {
                user.MatKhau = hash;
                next();
            })
        })
    } else {
        next();
    }

})

NguoiDungSchema.methods.verifyPassword = function(password){
    return bcrypt.compareSync(password,this.MatKhau);
}


NguoiDungSchema.statics.getHashPassword = function (password) {
    if (password != null) {
        
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    resolve(hash);
                })
            })
        })
    } else {
        return null;
    }

}

NguoiDungSchema.statics.hashPassword = function (password) {
    var salt = bcrypt.getSalt(10);
    return bcrypt.hashSync(password,salt);
}



NguoiDungSchema.statics.findByCredentials = function (Email, password) {
    var User = this;
    return User.findOne({ Email }).then((user) => {
        if (!user)
            return Promise.reject();
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.MatKhau, (err, res) => {
                if (res) {
                    resolve(user);
                }
                else
                    reject();
            })
        })
    });
}


NguoiDungSchema.statics.register = function (user) {
    var User = this;
    return User.findOne({ Email: user.Email }).then(data => {
        if (data === null) {
            user.Tokens.push({
                Token: createToken(user),
                Loai: "KichHoat"
            })
            return user.save();
        }
        return Promise.reject("Email Này Đã Đăng Ký Tài Khoản");
    })
}

NguoiDungSchema.methods.activeAccount = function () {
    var user = this;
    user.set({ IsActive: true });
    user.Tokens[0].Used = true;
    return user.save();
}

NguoiDungSchema.statics.findByToken = function (token, loai) {
    var User = this;
    return User.findOne({ 'Tokens.Token': token, 'Tokens.Loai': loai });
}

NguoiDungSchema.methods.createForgotpasswordToken = function () {
    var user = this;
    user.Tokens.push({
        Token: createToken(user),
        Loai: 'QuenMatKhau'
    })
    return user.save();
}

NguoiDungSchema.methods.getLastToken = function () {
    var user = this;
    return user.Tokens[user.Tokens.length - 1];
}

NguoiDungSchema.methods.getTokenIndex = function (token) {
    var user = this;
    for (var i = 0; i < user.Tokens.length; i++) {
        if (user.Tokens[i].Token === token)
            return i;
    }
    return -1;
}

NguoiDungSchema.methods.isAdmin = function (token) {
    return this.Role === 'Admin';
}

NguoiDungSchema.statics.isTokenExpired = function (token) {
    var date = token._id.getTimestamp().getTime();
    var now = new Date().getTime();
    return (now - date) > 24 * 60 * 60 * 1000;
}





//Export model
module.exports = mongoose.model('NguoiDung', NguoiDungSchema);