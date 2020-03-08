var NguoiDung = require('../models/NguoiDung');
var LichSuTimKiem = require('../models/LichSuTimKiem')
var HoaDon = require('../models/HoaDon')
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// Display detail page for a specific user.
exports.user_detail = function (req, res) {

    var user = req.user;

    if (user == undefined) {
        return res.redirect('/');
    }
    else {
        if (user._id != req.params.id) {
            return res.redirect('/');
        }

        // Successful
        res.render('user/user_dashboard', { title: "Trang của " + user.TenHienThi, user: user });
    }
};

// Display user create form on GET.
exports.user_create_get = function (req, res) {
    res.render('user/user_create', { title: 'Tạo người dùng' });
};

// Handle user create on POST.
exports.user_create_post = [

    // Validate fields.
    body('email', 'Email không hợp lệ.').isEmail(),
    body('user_name', 'Tên hiển thị không được để trống.').isLength({ min: 1 }).trim(),
    body('password', 'Mật khẩu phải dài hơn 5 ký tự.').isLength({ min: 5 }),

    // Sanitize fields.
    sanitizeBody('user_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {



        // Extract the validation errors from a request.
        var errors = validationResult(req);



        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user/user_create', { title: 'Tạo người dùng (lỗi)', errors: errors.array() });
            return;
        }
        else {

            var nguoidung = new NguoiDung(
                {
                    Email: req.body.email,
                    TenHienThi: req.body.user_name,
                    MatKhau: req.body.password,
                    IsActive: true
                });
            NguoiDung.register(nguoidung).then(user => {
                res.redirect('/admins/user_list');
            }).catch(err => {
                next(new Error(err));
            })
        }
    }
];

// Display user delete form on GET.
exports.user_delete_get = function (req, res, next) {

    async.parallel({
        user: function (callback) {
            NguoiDung.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.user == null) { // No results.
            res.redirect('/admins/user_list');
        }
        // Successful, so render.
        res.render('user/user_delete', { title: 'Xóa người dùng', user: results.user });
    });

};


// Handle user delete on POST.
exports.user_delete_post = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }
    var id = req.params.id;
    //kiem tra nguoi dung hien tai
    if (req.user._id.toHexString() === id) {
        return res.send({ err: true })
    }

    NguoiDung.findByIdAndRemove(id, function(err) {
        if (err) {
            return res.send({ err: true })
        }
        return res.send({ err: false })
    })
};


// Display user update form on GET.
exports.user_update_get = function (req, res, next) {

    NguoiDung.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        if (user == null) { // No results.
            var err = new Error('Không tìm thấy Thể loại');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user/user_update', { title: 'Sửa người dùng', updateUser: user });

    });
};

// Handle user update on POST.
exports.user_update_post = [

    // Validate fields.
    body('email', 'Email không hợp lệ.').isEmail(),
    body('user_name', 'Tên hiển thị không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('user_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        var errors = validationResult(req);
        var password = req.body.password;

        // Create an user object with escaped and trimmed data.
        var nguoidung = new NguoiDung(
            {
                _id: req.params.id,
                Email: req.body.email,
                TenHienThi: req.body.user_name,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user/user_update', { title: 'Sửa người dùng (lỗi)', updateUser: nguoidung, errors: errors.array() });
            return;
        }
        else {
            NguoiDung.findById(req.params.id).then(user => {
                if (!user) {
                    return res.redirect('/admins');
                }
                if (password !== "" && (password.length < 6 || password.length > 32)) {
                    errors = [{ msg: 'Mật Khẩu Phải từ 6 đến 32 ký tự' }];
                    res.render('user/user_update', { title: 'Sửa người dùng (lỗi)', updateUser: nguoidung, errors: errors });
                }
                if (password !== "") {
                    user.MatKhau = password;
                }
                user.Email = nguoidung.Email;
                user.TenHienThi = nguoidung.TenHienThi;
                return user.save();
            }).then((user) => {
                res.redirect('/admins/user_list');
            }).catch(err => {
                var err = new Error(err);
                next(err);
            })
        }
    }
];


// Display user update form on GET.
exports.user_change_info_get = function (req, res, next) {

    NguoiDung.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        if (user == null) { // No results.
            var err = new Error('Không tìm thấy Người dùng');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user/change_info', { title: 'Thay đổi thông tin', user: user });

    });
};

// Handle user update on POST.
exports.user_change_info_post = [

    // Validate fields.
    body('email', 'Email không hợp lệ.').isEmail(),
    body('user_name', 'Tên hiển thị không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('user_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        var TenHienThi = req.body.user_name;


        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user/change_info', { title: 'Thay đổi thông tin (lỗi)', user: nguoidung, errors: errors.array() });
            return;
        }
        else {
            NguoiDung.findById(req.params.id).then(user => {
                if (!user) {
                    return res.redirect(user.url);
                }
                user.TenHienThi = TenHienThi;
                return user.save();
            }).then((user) => {
                res.redirect(user.url);
            }).catch(err => {
                var err = new Error(err);
                next(err);
            })
        }
    }
];



// Display user change_password form on GET.
exports.user_change_password_get = function (req, res, next) {

    NguoiDung.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        if (user == null) { // No results.
            var err = new Error('Không tìm thấy Người dùng');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user/change_password', { title: 'Thay đổi mật khẩu', user: user });

    });
};

// Handle user change_password on POST.
exports.user_change_password_post = (req, res, next) => {

    async.parallel({
        user: function (callback) {
            NguoiDung.findById(req.params.id, callback);
        },
    }, function (err, results) {
        var errors;

        var user = results.user;
        var password = req.body.password;
        var newPassword = req.body.new_password;
        var confirmPassword = req.body.confirm_password;

        if (!user.verifyPassword(password)) {
            errors = [{ msg: "Password Cũ Không Chính Xác" }]
            res.render('user/change_password', { title: 'Thay đổi mật khẩu(lỗi)', errors });
            return;
        }

        if (newPassword !== confirmPassword) {
            errors = [{ msg: "Password và xác nhận password không giống nhau" }]
            res.render('user/change_password', { title: 'Thay đổi mật khẩu(lỗi)', errors });
            return;
        }

        user.MatKhau = newPassword;
        user.save().then(user_ => {
            req.logout();
            res.redirect('/');
        }).catch(err => {
            next(new Error(err));
        })

    }); // --End async--
};


exports.user_bills_get = function (req, res, next) {
    var id = req.params.id;
    NguoiDung.findById(req.params.id)
        .populate('HoaDon')
        .then(user => {
            if (user == null) { // No results.
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('user/user_bills', { title: 'Danh Sách Hóa Đơn', checkouts: user.HoaDon });

        }).catch(err => {
            return next(new Error(err));
        })
};

exports.user_search_get = function (req, res, next) {
    var id = req.params.id;
    NguoiDung.findById(req.params.id)
        .populate({ path: 'lsTimKiem', options: { sort: { 'ThoiDiem': -1 } } })
        .then(user => {
            if (user == null) { // No results.
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('user/user_searchs', { title: 'Danh Sách Tìm Kiếm', lichsus: user.lsTimKiem });
        }).catch(err => {
            return next(new Error(err));
        })
};

exports.user_search_delete = function (req, res, next) {
    var id = req.params.id;
    var sid = req.params.sid;
    NguoiDung.findById(req.params.id)
        .populate({ path: 'lsTimKiem', options: { sort: { 'ThoiDiem': -1 } } })
        .then(user => {
            if (user == null) { // No results.
                err.status = 404;
                return next(err);
            }
            var lsTK  = user.lsTimKiem;
            for(var i=0;i < lsTK.length;i++){
                if(lsTK[i]._id.toHexString() == sid){
                    return LichSuTimKiem.findByIdAndRemove(sid).then(ls=>{
                        return res.redirect(user.url + "/searchs");
                    })
                }
            }
            return res.redirect(user.url + "/searchs");
        }).catch(err => {
            return next(new Error(err));
        })
};