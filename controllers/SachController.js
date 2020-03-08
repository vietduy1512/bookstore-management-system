var SachBan = require('../models/SachBan');
var LichSuTimKiem = require('../models/LichSuTimKiem');
var TacGia = require('../models/TacGia')
var DanhGia = require('../models/DanhGia');
var TheLoai = require('../models/TheLoai');
var ObjectID = require('mongoose').Types.ObjectId;

var async = require('async');

// Thư viện để upload
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        // TODO: Add image validation
        callback(null, true)
    }
})
// --

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');




exports.index = function (req, res) {
    res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all books.
exports.book_list = function (req, res) {

    // Init Page & Number of item
    var number_of_limit_item = 28

    // Init "" then check if search_text have value
    var _search_text = ""
    if (req.query.search_text != undefined) {
        _search_text = req.query.search_text;
    }

    // Check and Parse Page
    var _page = 1
    if (req.query.page != undefined) {
        _page = parseInt(req.query.page);
    }

    var number_of_skip_item = 20 * (_page - 1)

    // Find Book
    async.parallel({
        sachban_count: function (callback) {
            SachBan.count({ TuaDe: { $regex: ".*" + _search_text + ".*", '$options': 'i' } }, callback);
        },

        list_books: function (callback) {
            SachBan.find({ TuaDe: { $regex: ".*" + _search_text + ".*", '$options': 'i' } })    // TODO: Thêm sách miễn phí sau
                .populate('TheLoai')
                .populate('TacGia')
                .populate('DanhGia')
                .skip(number_of_skip_item)
                .limit(number_of_limit_item)
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
        if (_search_text !== "" && req.user) {
            var ls = new LichSuTimKiem({
                URL: req.url,
                ChuoiTimKiem: _search_text
            })
            ls.save().then(ls_ => {
                req.user.lsTimKiem.push(ls_);
                req.user.save();
            }).catch(err => {
                console.log(err);
            })
        }
        var title = "Danh mục sách";
        if (_search_text !== "")
            title = "Tìm Kiếm: " + _search_text;


        // render trang
        res.render('book/book_list', {
            title, list_books: results.list_books, page: _page,
            sachban_count: results.sachban_count
        });
    });
};



// Advance Search
exports.advance_search_book_list = function (req, res) {

    // Init Page & Number of item
    var number_of_limit_item = 28

    // Init "" then check if search_text have value
    var _search_text = "";
    var query = {};
    var isSearch = false;
    if (req.query.search_text != undefined) {
        _search_text = req.query.search_text;
        isSearch = true;
    }

    // IMPORTANT! : Tạo query để search
    var d_query = {
        TuaDe: { $regex: ".*" + _search_text + ".*", '$options': 'i' },
        //TuaDe_ : _search_text
    };

    query.TuaDe = _search_text;

    // Init authors
    if (req.query.author != undefined) {
        d_query.TacGia = req.query.author;
        query.TacGia = req.query.author;
        isSearch = true;
    }
    // Init genres array
    if (req.query.genre != undefined) {
        query.TheLoai = JSON.stringify(req.query.genre);
        d_query.TheLoai = { $all: req.query.genre };
        isSearch = true;
    }
    // Init prices array
    if (req.query.price != undefined) {
        if (req.query.price[0] != "" && req.query.price[1] != "") {
            query.GiaMin = req.query.price[0];
            query.GiaMax = req.query.price[1];
            d_query.Gia = { $gt: req.query.price[0], $lt: req.query.price[1] };
            isSearch = true;
        }
    }

    // Check and Parse Page
    var _page = 1
    if (req.query.page != undefined) {
        _page = parseInt(req.query.page);
    }

    var number_of_skip_item = 20 * (_page - 1)


    // Find Book
    async.parallel({
        sachban_count: function (callback) {
            SachBan.count(d_query, callback);
        },
        list_authors: function (callback) {
            TacGia.find(callback);
        },
        list_genres: function (callback) {
            TheLoai.find(callback);
        },

        list_books: function (callback) {
            SachBan.find(d_query)    // TODO: Thêm sách miễn phí sau
                .populate('TheLoai')
                .populate('TacGia')
                .populate('DanhGia')
                .skip(number_of_skip_item)
                .limit(number_of_limit_item)
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
        console.log(isSearch);

        if (isSearch && req.user) {
            var ls = new LichSuTimKiem({
                URL: req.url,
                ChuoiTimKiem: "[Tìm Kiếm Nâng Cao]"
            })
            ls.save().then(ls_ => {
                req.user.lsTimKiem.push(ls_);
                req.user.save();
            }).catch(err => {
                console.log(err);
            })
            //req.user.lsTimKiem
        }
        // render trang
        res.render('book/advance_search_book_list', {
            title: "Tìm kiếm nâng cao", list_books: results.list_books,
            list_authors: results.list_authors, list_genres: results.list_genres, page: _page,
            sachban_count: results.sachban_count,
            query: query
        });
    });
};



// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
    var bookId = req.params.book_id;
    if (!ObjectID.isValid(bookId)) {
        var err = new Error('Không tìm thấy danh sách các sách');
        err.status = 404;
        return next(err);
    }
    SachBan.findOne({ _id: bookId })
        .populate('TheLoai')
        .populate('TacGia')
        .populate({
            path: 'DanhGia',
            model: 'DanhGia',
            populate: {
                path: 'NguoiDung',
                model: 'NguoiDung'
            },
            options: { sort: { "ThoiDiem": "desc" } }
        })
        .exec(function (err, book) {
            if (err) {
                res.send(err);
            } else {
                if (book === undefined || book === null) {
                    var err = new Error('Không tìm thấy danh sách các sách');
                    err.status = 404;
                    return next(err);
                }

                //chua xem sach
                if (req.cookies[bookId] === undefined) {
                    book.increaseView();
                    res.cookie(bookId, true, {
                        maxAge: 12 * 60 * 60 * 1000,
                        httpOnly: true
                    });
                }

                book.getRelatedBook().then((books) => {
                    book.DanhGiaLimit = book.DanhGia.slice(0, 5);
                    book.SachLienQuan = books;
                    res.render('book/book_detail', { title: book.TuaDe, book_detail: book });
                }).catch(err => {
                    console.log(err);
                    var err = new Error();
                    return next(err);
                })
            }
        });
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function (callback) {
            TacGia.find(callback);
        },
        genres: function (callback) {
            TheLoai.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('book/book_create', { title: 'Tạo sách', authors: results.authors, genres: results.genres });
    });

};

// Handle book create on POST.
exports.book_create_post = [
    upload.single('image'),

    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('isbn', 'Mã sách không được để trống.').isLength({ min: 1 }).trim(),
    body('title', 'Tựa đề không được để trống.').isLength({ min: 1 }).trim(),
    //body('image', 'Hình bìa không được để trống.').isLength({ min: 1 }).trim(),
    body('price', 'Giá tiền không được để trống và giá trị lớn hơn 1000.').isLength({ min: 1 }).trim(),
    body('author', 'Tác giả không được để trống.').isLength({ min: 1 }).trim(),
    body('summary', 'Giới thiệu không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        var errors = validationResult(req);

        // If there is no image
        if (req.file == undefined) {
            var error = { param: "title", msg: "Chưa đăng tải hình bìa lên.", value: req.body.title };
            errors = [];
            errors.push(error);
            // Get all authors and genres for form.
            async.parallel({
                authors: function (callback) {
                    TacGia.find(callback);
                },
                genres: function (callback) {
                    TheLoai.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                res.render('book/book_create', { title: 'Tạo sách (lỗi)', authors: results.authors, genres: results.genres, errors: errors });
            });
            return;

        } else {
            // Create a Book object with escaped and trimmed data.
            var sach = new SachBan(
                {
                    MaSach: req.body.isbn,
                    TuaDe: req.body.title,
                    HinhAnh: 'uploads/' + req.file.filename,
                    Gia: parseInt(req.body.price),
                    TacGia: req.body.author,
                    GioiThieu: req.body.summary,
                    TheLoai: req.body.genre
                });
        }


        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function (callback) {
                    TacGia.find(callback);
                },
                genres: function (callback) {
                    TheLoai.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (sach.TheLoai.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }

                res.render('book/book_create', {
                    title: 'Tạo sách (lỗi)', authors: results.authors, genres: results.genres,
                    book: sach, book_author_id: sach.TacGia, errors: errors.array()
                });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            sach.save(function (err) {
                if (err) {
                    return next(err);
                }
                //successful - redirect to new book record.
                res.redirect(sach.url);
            });
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res, next) {

    async.parallel({
        book: function (callback) {
            SachBan.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            res.redirect('/admins/genre_list');
        }
        // Successful, so render.
        res.render('book/book_delete', { title: 'Xóa sách', book: results.book });
    });

};

// Handle book delete on POST.
exports.book_delete_post = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    SachBan.findByIdAndRemove(id, function(err,book) {
        if (err) { 
            return res.send({err : true})
         }
        // Success - go to book list
        return res.send({err : false})
    });
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
    async.parallel({
        book: function (callback) {
            SachBan.findById(req.params.id)
                .populate('TacGia')
                .populate('TheLoai')
                .exec(callback);
        },
        authors: function (callback) {
            TacGia.find(callback);
        },
        genres: function (callback) {
            TheLoai.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            var err = new Error('Không tìm thấy sách');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.TheLoai.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() == results.book.TheLoai[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }

        res.render('book/book_update', {
            title: 'Sửa sách', authors: results.authors, genres: results.genres,
            book: results.book, book_author_id: results.book.TacGia._id
        });
    });
}


// Handle book update on POST.
exports.book_update_post = [
    upload.single('image'),

    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('isbn', 'Mã sách không được để trống.').isLength({ min: 1 }).trim(),
    body('title', 'Tựa đề không được để trống.').isLength({ min: 1 }).trim(),
    //body('image', 'Hình bìa không được để trống.').isLength({ min: 1 }).trim(),
    body('price', 'Giá tiền không được để trống và giá trị lớn hơn 1000.').isLength({ min: 1 }).trim(),
    body('author', 'Tác giả không được để trống.').isLength({ min: 1 }).trim(),
    body('summary', 'Giới thiệu không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Fix string not get '/'
        var image = req.body.image;
        if (image)
            image = image.replace('&#x2F;', '/');

        // Create a Book object with escaped/trimmed data and old id.
        var sach = new SachBan(
            {
                _id: req.params.id,
                MaSach: req.body.isbn,
                TuaDe: req.body.title,
                Gia: parseInt(req.body.price),
                TacGia: req.body.author,
                GioiThieu: req.body.summary,
                TheLoai: req.body.genre
            });

        if (image)
            sach.HinhAnh = image;

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function (callback) {
                    TacGia.find(callback);
                },
                genres: function (callback) {
                    TheLoai.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (sach.TheLoai.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book/book_update', {
                    title: 'Sửa sách (lỗi)', authors: results.authors, genres: results.genres,
                    book: sach, book_author_id: sach.TacGia, errors: errors.array()
                });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            SachBan.findByIdAndUpdate(req.params.id, sach, {}, function (err, book) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(book.url);
            });
        }
    }
];