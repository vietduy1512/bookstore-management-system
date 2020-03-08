const mongoose = require('mongoose');
const HoaDon = require('./HoaDon');
const TacGia = require('./TacGia');
const Schema = mongoose.Schema;


var SachBanSchema = new Schema({
    MaSach: { type: String, trim: true, required: true, maxlength: 20 },
    TuaDe: { type: String, trim: true, required: true, maxlength: 200 },
    HinhAnh: { type: String, trim: true, required: true, maxlength: 100 },
    GioiThieu: { type: String, trim: true, required: true },
    Gia: { type: Number, required: true, min: 1000 },
    TheLoai: [{ type: Schema.Types.ObjectId, ref: "TheLoai", required: true }],                     //TODO: Thêm require: true;
    TacGia: { type: Schema.Types.ObjectId, ref: "TacGia", required: true },
    DanhGia: [{ type: Schema.Types.ObjectId, ref: "DanhGia" }],
    View: { type: Number, default: 0, min: 0 }
}, { collection: 'SachBan' });


// Virtual for book's URL
SachBanSchema
    .virtual('url')
    .get(function () {
        return '/books/' + this._id;
    });

// Virtual for book's Danh Gia
SachBanSchema
    .virtual('TongDanhGia')
    .get(function () {
        return this.DanhGia.length;
    });



SachBanSchema.virtual('ChiTietDanhGia').get(function () {
    return GetDanhGiaDetail(this.DanhGia);
})

function GetDanhGiaDetail(danhgias) {
    var DanhGiaTrungBinh = 0;
    var ChiTietDanhGia = [0, 0, 0, 0, 0, 0];

    if (danhgias.length > 0) {
        var count_star = [0, 0, 0, 0, 0, 0];
        for (var i = 0; i < danhgias.length; i++) {
            DanhGiaTrungBinh += danhgias[i].Rate;
            count_star[danhgias[i].Rate]++;
        }
        DanhGiaTrungBinh /= danhgias.length;
        DanhGiaTrungBinh = Math.round(DanhGiaTrungBinh * 100) / 100;

        for (var i = 5; i >= 1; i--) {
            var precent = Math.round((count_star[i] / danhgias.length) * 100);
            ChiTietDanhGia[i] = precent
        }
    }

    return {
        SoLuong: danhgias.length,
        DanhGiaTrungBinh,
        ChiTietDanhGia
    }
}


//lay cach sacch lien quan
SachBanSchema.methods.getRelatedBook = function () {
    var book = this;
    var booksArr = [];
    return HoaDon.find({
        'ChiTiet.Book': book._id
    }).populate({
        path: 'ChiTiet.Book',
        model: 'SachBan',
        populate: {
            path: 'DanhGia',
            model: 'DanhGia'
        }
    }).then(hoadons => {
        //lay sach trong cac hoa don
        for (var i = 0; i < hoadons.length; i++) {
            var chitiet = hoadons[i].ChiTiet;
            for (var j = 0; j < chitiet.length; j++) {
                var book_ = chitiet[j].Book;
                if (book_._id.toHexString() !== book._id.toHexString()
                    && booksArr.indexOf(book_) == -1) {
                    booksArr.push(book_);
                }
            }
        }
        //lay cung tac gia
        return SachBan.find({ TacGia: book.TacGia._id })
            .populate('TacGia')
            .populate('DanhGia');
    }).then(books => {
        for (var i = 0; i < books.length; i++) {
            var book_ = books[i];
            if (book_._id.toHexString() !== book._id.toHexString()
                && booksArr.indexOf(book_) == -1) {
                booksArr.push(book_);
            }
        }
        //lay cung the loai
        return SachBan.find({ TheLoai: { $all: book.TheLoai } })
            .populate('TacGia')
            .populate('DanhGia')
    }).then(book_s => {
        for (var i = 0; i < book_s.length; i++) {
            var book_ = book_s[i];
            if (book_._id.toHexString() !== book._id.toHexString()
                && booksArr.indexOf(book_) == -1) {
                booksArr.push(book_);
            }
        }
        return Promise.resolve(booksArr);
    });
}

SachBanSchema.methods.increaseView = function () {
    var book = this;
    var view = book.View;
    book.View = view + 1;
    return book.save();
}

var SachBan = mongoose.model('SachBan', SachBanSchema);
module.exports = SachBan;