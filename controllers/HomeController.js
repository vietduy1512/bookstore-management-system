var SachBan = require('../models/SachBan');
var TacGia = require('../models/TacGia')
var DanhGia = require('../models/DanhGia');
var TheLoai = require('../models/TheLoai');

var async = require('async');


exports.index = function (req, res) {

    // Init Page & Number of item
    var number_of_limit_item = 4

  
       // Find Book
    async.parallel({
        sachban_count: function (callback) {
            SachBan.count(callback);
        },
        tacgia_count: function (callback) {
            TacGia.count(callback);
        },

        list_books: function (callback) {
            SachBan.find({})    // TODO: Thêm sách miễn phí sau
                .populate('TheLoai')
                .populate('TacGia')
                .populate('DanhGia')
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

        // render trang
        res.render('index', {
            title: "Trang chủ", list_books: results.list_books, tacgia_count: results.tacgia_count,
            sachban_count: results.sachban_count
        });
    });
};