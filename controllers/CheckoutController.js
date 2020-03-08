var app = require('./../app');
var HoaDon =require('./../models/HoaDon');
var NguoiDung = require('./../models/NguoiDung');
var EmailController = require('./EmailController');




var TinhThue = (total)=>{
    return total * 12/100;
}

exports.getCheckoutPage = (req,res,next)=>{
    var PhiVC = 15000;
    var totalcart = req.session.totalcart;

    var Thue = TinhThue(totalcart);
    var canCheckout = false;

    if(totalcart != undefined && totalcart > 0 ){
        canCheckout = true;
    }
    res.render('checkout/checkout',{Thue,canCheckout ,PhiVC
                    ,Tong: totalcart + Thue + PhiVC});
}

exports.thanhToan = (req,res,next)=>{
    res.setHeader('Content-Type', 'application/json');

    var user = req.user;
    var cart= req.session.shoppingcart;
    var Gia = 0;

    if (user === undefined) {
        return res.send(JSON.stringify({
            err: true,
            authenRequire: true
        }));
    }

    if(cart === undefined || cart.length < 1){
        return res.send(JSON.stringify({
            err: true,
            errMsg: "Giỏ Hàng Rỗng"
        }));
    }

    console.log(req.body);

    var ChiTiet = [];
    for(var i=0;i<cart.length;i++){
        ChiTiet.push({
            Book : cart[i].book._id,
            SoLuong : cart[i].soluong
        })
        Gia+= cart[i].book.Gia*cart[i].soluong;
    }
    var TongTien = Gia;
    var Thue = TinhThue(Gia);
    Gia+= Thue;

    console.log(ChiTiet);

    var DiaChi = req.body.DiaChi + "," + req.body.PhuongXa + "," + req.body.QuanHuyen+ "," + req.body.TinhTP;

    var VanChuyen = {
        Loai : req.body.hinhthucgh,
        HoTen :req.body.HoTen,
        SoDT : req.body.SoDT,
        DiaChi
    }

    var PhiVC = 15000;
    if(req.body.hinhthucgh === "Nhanh"){
        Gia+=20000;
    }
    Gia += PhiVC;

    var ThanhToan= {
        Loai : req.body.hinhthuctt
    }

    if(req.body.hinhthuctt === "CreditCard"){
        ThanhToan.MaThe = req.body.MaThe,
        ThanhToan.TenChuThe = req.body.TenChuThe,
        ThanhToan.NgayHetHan = req.body.NgayHetHan
    }

    var newHoaDon = new HoaDon({
        ChiTiet,
        Gia,
        NguoiDung : user._id,
        VanChuyen,
        ThanhToan
    })

    console.log(user._id);
    newHoaDon.save().then((hd) => {
        
        return NguoiDung.findByIdAndUpdate(user._id,{ $push: { HoaDon: hd } }).then((nguoidung)=>{
            if(nguoidung === undefined || nguoidung === null ){
                return Promise.reject();

            }else{
                var cart = req.session.shoppingcart;
                
                req.session.shoppingcart = undefined;
                res.send(JSON.stringify({
                    err: false,
                }));
                console.log(cart);
                EmailController.sendCheckoutEmail(nguoidung.Email,cart,TongTien,PhiVC,Thue,newHoaDon);
            }
        })
    }).catch(err => {
        console.log(err);
        return res.send(JSON.stringify({
            err: true,
            errMsg: "Không Thể Thanh Toán"
        }));
    })

}


exports.get_details_page = (req,res,next)=>{
    var id = req.params.id;
    HoaDon.findById(id).then(checkout=>{
        if(!checkout){
            var err = new Error();
            err.status = 404;
            return next(err);
        }
        res.render('checkout/checkout_details',{
            Title : "Chi Tiết Hóa Đơn",
            checkout
        })
    }).catch(err=>{
        next(new Error(err));
    })
}

exports.delete_checkout_post = (req,res,next)=>{
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    HoaDon.findByIdAndRemove(id, function(err) {
        if (err) {
            return res.send({ err: true })
        }
        return res.send({ err: false })
    })
}