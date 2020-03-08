var NguoiDung = require('./../models/NguoiDung');
var bcrypt = require('bcryptjs');
var EmailController = require('./EmailController');

exports.login = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var Email = req.body.email_login;
    var password = req.body.password_login;


    NguoiDung.findByCredentials(Email, password).then(user => {
        if (!user.IsActive)
            return res.send(JSON.stringify({ err: true, requestActive: true }));
        req.login(user, function (err) {
            if (err) return res.send(JSON.stringify({ err: true, message: "Email Hoặc Mật Khẩu Không Chính Xác" }));
            res.send(JSON.stringify({ err: false }));
        });

    }).catch(err => {
        res.send(JSON.stringify({ err: true, message: "Email Hoặc Mật Khẩu Không Chính Xác" }));
    })
}


exports.register = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var Email = req.body.email_register;
    var name = req.body.name_register;
    var password = req.body.password_register;
    var retype_password = req.body.password_retype;

    var errMsg = "";
    if (name === "") {
        errMsg = "Tên Người Dùng Không Được Trống</br>";
    }
    if (password != retype_password) {
        errMsg += "Xác Nhận Mật Khẩu Không Khớp</br>";
    }
    if (password.length < 6 || password.length > 32) {
        errMsg += "Mật khẩu phải từ 6 đến 32 ký tự";
    }
    if (errMsg !== "") {
        return res.send(JSON.stringify({ err: true, message: errMsg }));
    }

    var nUser = new NguoiDung({
        Email,
        TenHienThi: name,
        MatKhau: password
    });

    NguoiDung.register(nUser).then(user => {
        res.send(JSON.stringify({ err: false }));
        var token = user.Tokens[0];
        user.activeAccount()
        // EmailController.sendActiveAccountEmail(user.Email, token);
    }).catch(err => {
        console.log(err);
        res.send(JSON.stringify({ err: true, message: err }));
    })

}

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
}


exports.activeAccount = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    var token = req.params.token;

    NguoiDung.findByToken(token, "KichHoat").then(user => {
        if (user === null || user.IsActive) {
            var err = new Error('Không tìm thấy Token Hoặc Người Dùng');
            err.status = 404;
            return next(err);
        }

        return user.activeAccount()
    }).then(user => {
        req.login(user, function (err) {
            if (err)
                console.log(err);
        });
        res.render('user/active_account', { title: "Kích Hoạt Tài Khoản", Email: user.Email });
    }).catch(err => {
        var error = new Error(err);
        error.status = 500;
        return next(error);
    })
}


exports.resendActiveEmail = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.send(JSON.stringify({ err: true }))
    }
    res.setHeader('Content-Type', 'application/json');
    var Email = req.body.Email;
    NguoiDung.findOne({ Email }).then((user) => {
        if (user === null) {
            return res.send(JSON.stringify({ err: true }))
        }
        if (user.IsActive)
            return res.send(JSON.stringify({ err: true }))
        var token = user.Tokens[0];
        EmailController.sendActiveAccountEmail(user.Email, token);
        return res.send(JSON.stringify({ err: false }))
    }).catch(err => {
        return res.send(JSON.stringify({ err: true }))
    })
}

exports.forgotpassword = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.send(JSON.stringify({ err: true }))
    }

    res.setHeader('Content-Type', 'application/json');
    var Email = req.body.Email;
    console.log(Email);

    NguoiDung.findOne({ Email }).then((user) => {
        if (user === null) {
            return res.send(JSON.stringify({ err: true, message: "Không Tìm Thấy Email " + Email + "." }))
        }
        console.log(user);
        return user.createForgotpasswordToken();
    }).then(user_ => {
        var token = user_.getLastToken();
        console.log(token);
        EmailController.sendResetPasswordEmail(user.Email, token);
        return res.send(JSON.stringify({ err: false }))
    }).catch(err => {
        return res.send(JSON.stringify({ err: true }))
    })
}

exports.getResetPasswordPage = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    var token = req.params.token;
    console.log(token);
    NguoiDung.findByToken(token, "QuenMatKhau").then(user => {
        console.log(user);
        if (user === null) {
            var err = new Error('Không tìm thấy Token Hoặc Người Dùng');
            err.status = 404;
            return next(err);
        }

        var index = user.getTokenIndex(token);
        var Token = user.Tokens[index];
        if (Token.Used) {
            var err = new Error();
            err.status = 404;
            return next(err);
        }

        if(NguoiDung.isTokenExpired(Token)){
            var err = new Error();
            err.status = 404;
            return next(err);
        }

        return res.render('user/reset_password', { title : "Đặt Lại Mật Khẩu",user });

    }).catch(err => {
        var error = new Error(err);
        error.status = 500;
        return next(error);
    })

}

exports.resetPassword = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.isAuthenticated()) {
        return res.send(JSON.stringify({ err: true, message: "" }))
    }
    var token = req.params.token;
    var password = req.body.password;
    var retype_password = req.body.password_retype;

    var errMsg = "";
    if (password != retype_password) {
        errMsg += "Xác Nhận Mật Khẩu Không Khớp</br>";
    }
    if (password.length < 6 || password.length > 32) {
        errMsg += "Mật khẩu phải từ 6 đến 32 ký tự";
    }
    if (errMsg !== "") {
        return res.send(JSON.stringify({ err: true, message: errMsg }));
    }

    console.log(token);


    NguoiDung.findByToken(token, "QuenMatKhau").then(user => {
        if (user === null) {
            return res.send(JSON.stringify({ err: true, message: "" }))
        }

        var index = user.getTokenIndex(token);
        var Token = user.Tokens[index];
        if (Token.Used) {
            return res.send(JSON.stringify({ err: true, message: "" }))
        }
        console.log(user);
        console.log(Token);

        user.MatKhau = password;
        user.Tokens[index].Used = true;
        console.log(user);

        return user.save()
    }).then(user_ => {
        console.log(user_);
        return res.send(JSON.stringify({ err: false }))
    }).catch(err => {
        return res.send(JSON.stringify({ err: true, message: "" }))
    })

}