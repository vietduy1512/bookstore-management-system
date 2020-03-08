var SachBan = require('../models/SachBan');
var TacGia = require('../models/TacGia')
var DanhGia = require('../models/DanhGia');

exports.rating_create = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var user = req.user;
    if (user === undefined) {
        return res.send(JSON.stringify({
            err: true,
            authenRequire: true
        }));
    }

    var SachID = req.body.SachID;
    if (req.body.TieuDe.trim() === "" || req.body.NoiDung.trim() === "") {
        return res.send(JSON.stringify({
            err: true,
            errMsg: "Tiêu Đề Và Nội Dung Bình Luận Không Được Rỗng"
        }));
    }

    SachBan.findById(SachID).then((sach) => {
        var newBL = new DanhGia({
            TieuDe: req.body.TieuDe,
            NoiDung: req.body.NoiDung,
            NguoiDung: req.user._id,
            ThoiDiem: new Date(),
            Sach : SachID,
            Rate: req.body.Rate
        })
        return newBL.save().then((bl) => {
            return sach.update({ $push: { DanhGia: bl } }).then((usach) => {
                TenNguoiDung = req.user.TenHienThi;
                res.send(JSON.stringify({
                    err: false,
                    BinhLuan: bl,
                    TenNguoiDung
                }));
            })
        });
    }).catch(err => {
        console.log(err);
        return res.send(JSON.stringify({
            err: true,
            errMsg: "Không Thể Thêm Đánh Giá"
        }));
    })

}


exports.get_more_rating_of_book = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    var bookId = req.params.bookId;
    var number = req.params.number;

    SachBan.findById(bookId)
        .populate({
            path: 'DanhGia',
            model: 'DanhGia',
            populate: {
                path: 'NguoiDung',
                model: 'NguoiDung'
            },
            options: { sort: { "ThoiDiem": "desc" } }
        }).then(book=>{
            if(book===null || book === undefined){
                return Promise.reject();
            }
            var danhgia = book.DanhGia.slice(number,number+5);
            res.send(danhgia)
        }).catch(err=>{
            res.send(JSON.stringify({
                err : true
            }))
        })

};

exports.rating_delete_post = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    DanhGia.findByIdAndRemove(id, function(err,danhgia) {
        if (err) { 
            return res.send({err : true})
         }
        return res.send({err : false})
    });
};