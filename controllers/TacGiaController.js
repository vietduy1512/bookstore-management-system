var TacGia = require('../models/TacGia');
var SachBan = require('../models/SachBan')

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Author list');
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res, next) {
    var authorId = req.params.author_id;
    TacGia.findById(authorId).then((author) => {
        if (author === null || author === undefined) {
            return Promise.reject();
        }

        return SachBan.find({ TacGia: authorId })    // TODO: Thêm sách miễn phí sau
            .populate('TheLoai')
            .populate('TacGia')
            .populate('DanhGia')
            .then(list_books => {

                // Successful
                var _page = 1
                var number_of_item = 12

                // Lấy các item index tương ứng với trang
                if (req.query.page != null) {
                    _page = parseInt(req.query.page);
                }
                var end_item_index = number_of_item * _page;
                var list_books_per_page = list_books.slice(end_item_index - number_of_item, end_item_index);


                res.render('author/author_detail', {
                    list_books: list_books_per_page
                    , page: _page
                    , sach_count: list_books.length
                    , author
                    , title: 'Tác Giả: ' + author.Ten
                });
            })
    }).catch((err) => {
        var err = new Error();
        err.status = 404;
        next(err);
    })
};

// Display Author create form on GET.
exports.author_create_get = function (req, res) {
    res.render('author/author_form', { title: 'Tạo tác giả' });
};

// Handle Author create on POST.
exports.author_create_post = [

    // Validate fields.
    body('author_name', 'Tên tác giả không được để trống.').isLength({ min: 1 }).trim(),
    body('date_of_birth', 'Ngày sinh không hợp lệ.').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Ngày mất không hợp lệ.').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('author_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an Author object with escaped and trimmed data.
        var tacgia = new TacGia(
            {
                Ten: req.body.author_name,
                NgaySinh: req.body.date_of_birth,
                NgayMat: req.body.date_of_death
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author/author_form', { title: 'Tạo tác giả (lỗi)', author: tacgia, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            tacgia.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect('/admins/author_list');
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {

    async.parallel({
        author: function (callback) {
            TacGia.findById(req.params.id).exec(callback)
        },
        authors_books: function (callback) {
            SachBan.find({ 'TacGia': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.author == null) { // No results.
            res.redirect('/admins/author_list');
        }
        // Successful, so render.
        res.render('author/author_delete', { title: 'Xóa tác giả', author: results.author, author_books: results.authors_books });
    });

};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    // genre has no books. Delete object and redirect to the list of genres.
    TacGia.findByIdAndRemove(id, function(err) {
        if (err) {
            return res.send({ err: true })
        }
        // Success - go to genre list
        return res.send({ err: false })
    })
};

// Display Author update form on GET.
exports.author_update_get = function (req, res, next) {

    TacGia.findById(req.params.id, function (err, author) {
        if (err) { return next(err); }
        if (author == null) { // No results.
            var err = new Error('Không tìm thấy Tác giả');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('author/author_form', { title: 'Sửa tác giả', author: author });

    });
};

// Handle Author update on POST.
exports.author_update_post = [

    // Validate fields.
    body('author_name', 'Tên tác giả không được để trống.').isLength({ min: 1 }).trim(),
    body('date_of_birth', 'Ngày sinh không hợp lệ.').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Ngày mất không hợp lệ.').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('author_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var tacgia = new TacGia(
            {
                _id: req.params.id,
                Ten: req.body.author_name,
                NgaySinh: req.body.date_of_birth,
                NgayMat: req.body.date_of_death
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author/author_form', { title: 'Sửa tác giả (lỗi)', author: tacgia, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            TacGia.findByIdAndUpdate(req.params.id, tacgia, {}, function (err, author) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to genre detail page.
                res.redirect('/admins/author_list');
            });
        }
    }
];
