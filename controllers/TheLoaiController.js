var SachBan = require('../models/SachBan');
var TacGia = require('../models/TacGia')
var TheLoai = require('../models/TheLoai');

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// Display list of all Genre.
exports.genre_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre list');
};

// Display detail page for a specific Genre.
exports.book_list_of_genre = function (req, res, next) {

    // Init Page & Number of item
    var number_of_limit_item = 28

    // Init "" then check if search_text have value
    var _search_text = ""
    if (req.query.search_text != undefined) {
        _search_text = req.query.search_text;
    }

    // Init 1 then check if search_text have value
    var _page = 1
    if (req.query.page != undefined) {
        _page = parseInt(req.query.page);
    }

    var number_of_skip_item = 20 * (_page - 1)

    // Process
    async.parallel({
        genre: function (callback) {
            TheLoai.findById(req.params.genre_id)
                .exec(callback);
        },

        sachban_count: function (callback) {
            SachBan.count({ TheLoai: req.params.genre_id, TuaDe: { $regex: ".*" + _search_text + ".*" } }, callback);
        },

        list_books: function (callback) {
            SachBan.find({ TheLoai: req.params.genre_id, TuaDe: { $regex: ".*" + _search_text + ".*" } })    // TODO: Thêm sách miễn phí sau
                .populate('TheLoai')
                .populate('TacGia')
                .skip(number_of_skip_item)
                .limit(number_of_limit_item)
                .exec(callback);
        },

    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre == null) { // No results.
            var err = new Error('Không tìm thấy thể loại.');
            err.status = 404;
            return next(err);
        }

        // render trang
        res.render('book/book_list', {
            title: "Thể loại: " + results.genre.Ten, list_books: results.list_books, page: _page, genre_name: results.genre.Ten,
            sachban_count: results.sachban_count
        });
    });
};


// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
    res.render('genre/genre_form', { title: 'Tạo thể loại' });
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('genre_name', 'Tên thể loại không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('genre_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var theloai = new TheLoai({ Ten: req.body.genre_name });


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre/genre_form', { title: 'Tạo thể loại (lỗi)', genre: theloai, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            TheLoai.findOne({ 'Ten': req.body.genre_name })
                .exec(function (err, found_theloai) {
                    if (err) { return next(err); }
                    console.log(found_theloai);
                    if (found_theloai) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_theloai.url);
                    }
                    else {
                        theloai.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect('/admins/genre_list');
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            TheLoai.findById(req.params.id).exec(callback)
        },
        genres_books: function (callback) {
            SachBan.find({ 'TheLoai': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { // No results.
            res.redirect('/admins/genre_list');
        }
        // Successful, so render.
        res.render('genre/genre_delete', { title: 'Xóa thể loại', genre: results.genre, genre_books: results.genres_books });
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    // genre has no books. Delete object and redirect to the list of genres.
    TheLoai.findByIdAndRemove(id, function deleteGenre(err) {
        if (err) {
            return res.send({ err: true })
        }
        // Success - go to genre list
        return res.send({ err: false })
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {

    TheLoai.findById(req.params.id, function (err, genre) {
        if (err) { return next(err); }
        if (genre == null) { // No results.
            var err = new Error('Không tìm thấy Thể loại');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('genre/genre_form', { title: 'Sửa thể loại', genre: genre });

    });
};

// Handle Genre update on POST.
exports.genre_update_post = [

    // Validate that the name field is not empty.
    body('genre_name', 'Tên thể loại không được để trống.').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('genre_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var theloai = new TheLoai(
            {
                _id: req.params.id,
                Ten: req.body.genre_name
            });


        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('genre/genre_form', { title: 'Sửa thể loại (lỗi)', genre: theloai, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            TheLoai.findByIdAndUpdate(req.params.id, theloai, {}, function (err, genre) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to genre detail page.
                res.redirect('/admins/genre_list');
            });
        }
    }
];