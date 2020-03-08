var SachBan = require('../models/SachBan');
var TacGia = require('../models/TacGia')
var DanhGia = require('../models/DanhGia');
var TheLoai = require('../models/TheLoai');
var NguoiDung = require('../models/NguoiDung');
var HoaDon = require('../models/HoaDon')

var async = require('async');
var bcrypt = require('bcryptjs');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// Kiểm tra có phải admin ko?
var AdminAuthorization = function (user, res) {
    if (user == undefined) {
        res.redirect('/admins/login')
    } else {
        if (user.Role == undefined) {
            res.redirect('/admins/login')
        }
    }
}


// Login GET
exports.admin_login_get = function (req, res) {
    res.render('admin/admin_login')
};

// Login POST
exports.admin_login_post = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var Email = req.body.email_login;
    var password = req.body.password_login;
    NguoiDung.findByCredentials(Email, password).then((admin) => {
        if (!admin)
            return Promise.reject();
        if (!admin.isAdmin()) {
            return Promise.reject();
        }
        req.login(admin, function (err) {
            if (err) return res.send(JSON.stringify({ err: true, message: "Email Hoặc Mật Khẩu Không Chính Xác" }));
            res.send(JSON.stringify({ err: false }));
        });
    }).catch(err => {
        res.send(JSON.stringify({ err: true, message: "Email Hoặc Mật Khẩu Không Chính Xác" }));
    })
};

function getChartString(data) {
    var arr = [];
    for (var i = 0; i < data.length; i++) {
        var data_ = data[i];
        var arr_ = [];
        for (var key in data_) {
            if (key !== "Number")
                arr_.push(data_[key]);
        }
        arr.push(arr_);
    }
    return JSON.stringify(arr);
}

exports.get_thongke_page = function (req, res, next) {
    HoaDon.find({})
        .sort({ ThoiDiem: 'asc' })
        .populate({
            path: 'ChiTiet.Book',
            model: 'SachBan'
        })
        .then(hoadons => {
            //console.log(hoadons[0].ChiTiet);
            var tkTimes = HoaDon.getThongKeByTime(hoadons);
            //var tkSachs = HoaDon.getThongKeByBook(hoadons);
            //res.send(JSON.stringify(tkTimes,null,2));
            res.render('admin/admin_thongke', {
                tkTimes,
                Month: getChartString(tkTimes.Month),
                Year: getChartString(tkTimes.Year),
                Date: getChartString(tkTimes.Date),
                Week: getChartString(tkTimes.Week),
                Quarter: getChartString(tkTimes.Quarter)
            })

        }).catch(err => {
            var err_ = new Error(err);
            next(err_);
        })
}

// Manage Books
exports.admin_dashboard = function (req, res) {
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        books: function (callback) {
            SachBan.find(callback);
        },
        users: function (callback) {
            NguoiDung.find(callback);
        },
        authors: function (callback) {
            TacGia.find(callback);
        },
        bills: function (callback) {
            HoaDon.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('admin/admin_index', { title: 'Admin Dashboard', results });
    });
};

// Manage Books
exports.admin_book_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    async.parallel({
        sachban_count: function (callback) {
            SachBan.count({}, callback);
        },
        list_books: function (callback) {
            SachBan.find({})    // TODO: Thêm sách miễn phí sau
                .populate('TheLoai')
                .populate('TacGia')
                .populate('DanhGia')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_books == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các sách');
            err.status = 404;
            return next(err);
        }

        // Successful
        res.render('admin/admin_book_list', {
            title: "Quản lý sách", list_books: results.list_books,
            sachban_count: results.sachban_count
        });
    });
};



// Manage Genres
exports.admin_genre_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    async.parallel({
        genre_count: function (callback) {
            TheLoai.count({}, callback);
        },
        list_genres: function (callback) {
            TheLoai.find({})
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_genres == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các thể loại');
            err.status = 404;
            return next(err);
        }
        // Successful
        res.render('admin/admin_genre_list', {
            title: "Quản lý thể loại", list_genres: results.list_genres,
            genre_count: results.genre_count
        });
    });
};



// Manage Authors
exports.admin_author_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    async.parallel({
        author_count: function (callback) {
            TacGia.count({}, callback);
        },
        list_authors: function (callback) {
            TacGia.find({})
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_authors == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các tác giả');
            err.status = 404;
            return next(err);
        }
        // Successful
        res.render('admin/admin_author_list', {
            title: "Quản lý tác giả", list_authors: results.list_authors,
            author_count: results.author_count
        });
    });
};



// Manage Users
exports.admin_user_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    async.parallel({
        user_count: function (callback) {
            NguoiDung.count({}, callback);
        },
        list_users: function (callback) {
            NguoiDung.find({})
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_users == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các người dùng');
            err.status = 404;
            return next(err);
        }
        // Successful
        res.render('admin/admin_user_list', {
            title: "Quản lý người dùng", list_users: results.list_users,
            sachban_count: results.sachban_count
        });
    });
};



// Manage Admins
exports.admin_admin_list = function (req, res) {

    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }


    async.parallel({
        admin_count: function (callback) {
            NguoiDung.count({ Role: 'Admin' }, callback);
        },
        list_admins: function (callback) {
            NguoiDung.find({ Role: 'Admin' })
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_admins == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các quản lý');
            err.status = 404;
            return next(err);
        }

        // Successful
        res.render('admin/admin_admin_list', {
            title: "Quản lý quản lý", list_admins: results.list_admins,
            sachban_count: results.sachban_count
        });
    });
};



// Manage Checkouts
exports.admin_checkout_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    async.parallel({
        checkout_count: function (callback) {
            HoaDon.count({}, callback);
        },
        list_checkouts: function (callback) {
            HoaDon.find({})
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.list_checkouts == null) { // No results.
            var err = new Error('Không tìm thấy danh sách các hóa đơn');
            err.status = 404;
            return next(err);
        }
        // Successful
        res.render('admin/admin_checkout_list', {
            title: "Quản lý đơn hàng", list_checkouts: results.list_checkouts,
            sachban_count: results.sachban_count
        });
    });
};


exports.admin_change_checkout_status = function (req, res) {
    var id = req.params.id;
    var status = req.body.TinhTrang;

    res.setHeader('Content-Type', 'application/json');

    if (status == undefined) {
        return res.send(JSON.stringify({
            error: true
        }))
    }

    HoaDon.findById(id).then((hoadon) => {
        if (hoadon === null) {
            return Promise.reject('ID not Found');
        }
        return hoadon.changeStatus(status);
    }).then(hoadon_ => {
        if (hoadon_ === null)
            return Promise.reject('DB Error');
        return res.send(JSON.stringify({
            error: false
        }))
    }).catch(err => {
        console.log(err);
        return res.send(JSON.stringify({
            error: true,
            message: err
        }))
    })
}



// Display detail page for a specific admin.
exports.admin_detail = function (req, res) {
    res.redirect('admins/book_list')
};

// Display admin create form on GET.
exports.admin_create_get = function (req, res) {
    res.render('admin/admin_create', { title: 'Tạo quản lý' });
};

// Handle admin create on POST.
exports.admin_create_post = [

    // Validate fields.
    body('email', 'Email không hợp lệ.').isEmail(),
    body('admin_name', 'Tên hiển thị không được để trống.').isLength({ min: 1 }).trim(),
    body('password', 'Mật khẩu phải dài hơn 5 ký tự.').isLength({ min: 5 }),

    // Sanitize fields (using wildcard).
    sanitizeBody('admin_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an admin object with escaped and trimmed data.
        var quanly = new NguoiDung(
            {
                Email: req.body.email,
                TenHienThi: req.body.admin_name,
                MatKhau: req.body.password,
                Role: 'Admin',
                IsActive: true
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('admin/admin_create', { title: 'Tạo quản lý (lỗi)', admin: quanly, errors: errors.array() });
            return;
        } else {
            NguoiDung.register(quanly).then(user => {
                res.redirect('/admins/admin_list');
            }).catch(err => {
                next(new Error(err));
            })
        }
    }
];

// Display admin delete form on GET.
exports.admin_delete_get = function (req, res, next) {

    async.parallel({
        admin: function (callback) {
            NguoiDung.findOne({ _id: req.params.id, Role: 'Admin' }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.admin == null) { // No results.
            res.redirect('/admins/admin_list');
        }
        // Successful, so render.
        res.render('admin/admin_delete', { title: 'Xóa quản lý', admin: results.admin });
    });

};

// Handle admin delete on POST.
exports.admin_delete_post = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }
    var id = req.params.id;
    //kiem tra nguoi dung hien tai
    if (req.user._id.toHexString() === id) {
        return res.send({ err: true })
    }

    // admin has no admins. Delete object and redirect to the list of admins.
    NguoiDung.findByIdAndRemove(id, function deleteAdmin(err) {
        if (err) {
            return res.send({ err: true })
        }
        return res.send({ err: false })
    })
};

// Display admin update form on GET.
exports.admin_update_get = function (req, res, next) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }
    NguoiDung.findById(req.params.id, function (err, admin) {
        if (err) { return next(err); }
        if (admin == null || !admin.isAdmin()) { // No results.
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('admin/admin_update', { title: 'Sửa quản lý', admin: admin });

    });
};

// Handle admin update on POST.
exports.admin_update_post = [
    // Validate fields.
    body('email', 'Email không hợp lệ.').isEmail(),
    body('admin_name', 'Tên hiển thị không được để trống.').isLength({ min: 1 }).trim(),
    // Sanitize fields (using wildcard).
    sanitizeBody('admin_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        if (!req.isAdmin) {
            return res.redirect('/admins/login')
        }
        // Extract the validation errors from a request.
        var errors = validationResult(req);
        var password = req.body.password;

        // Create an admin object with escaped and trimmed data.
        var quanly = new NguoiDung(
            {
                _id: req.params.id,
                Email: req.body.email,
                TenHienThi: req.body.admin_name
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('admin/admin_update', { title: 'Sửa quản lý (lỗi)', admin: quanly, errors: errors.array() });
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
                user.Email = quanly.Email;
                user.TenHienThi = quanly.TenHienThi;
                return user.save();
            }).then((user) => {
                res.redirect('/admins/admin_list');
            }).catch(err => {
                var err = new Error(err);
                next(err);
            })
        }
    }
];


exports.admin_change_role = (req, res, next) => {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }
    var id = req.params.id;
    var role = req.params.role;
    var mode = req.query.mode;
    var redirect;
    if (mode)
        redirect = '/admins/admin_list'
    else
        redirect = '/admins/user_list'

    NguoiDung.findById(id).then(user => {
        if (!user)
            return res.redirect(redirect);
        user.Role = role;
        return user.save();
    }).then(user_ => {
        return res.redirect(redirect);
    }).catch(err => {
        var err_ = new Error(err);
        next(err_);
    })
}

// Manage Rating
exports.admin_rating_list = function (req, res) {
    if (!req.isAdmin) {
        return res.redirect('/admins/login')
    }

    DanhGia.find({}).populate('Sach').populate('NguoiDung')
        .then(list_ratings => {
            return res.render('admin/admin_rating_list', {
                title: "Quản lý đánh giá", list_ratings
            });
        }).catch(err => {
            return next(new Error(err));
        })
};