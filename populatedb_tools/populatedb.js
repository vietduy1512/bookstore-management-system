#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var KhachThamQuan = require('./models/KhachThamQuan')
var TheTinDung = require('./models/TheTinDung')
var DanhGia = require('./models/DanhGia')
var BinhLuan = require('./models/BinhLuan')
var LichSuDocSach = require('./models/LichSuDocSach')
var LichSuTimKiem = require('./models/LichSuTimKiem')
var TheLoai = require('./models/TheLoai')
var SachMienPhi = require('./models/SachMienPhi')
var SachBan = require('./models/SachBan')
var TacGia = require('./models/TacGia')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var KhachThamQuan_Data = []
var TheTinDung_Data = []

var DanhGia_Data = []
var BinhLuan_Data = []  
var LichSuDocSach_Data = []
var LichSuTimKiem_Data = []
var TheLoai_Data = []
var TacGia_Data = []
var SachBan_Data = []
var SachMienPhi_Data = []


// == Create Instance ==================================================

function KhachThamQuanCreate(email, cmnd, matkhau, tenhienthi, the, 
  lstimkiem, lsdocsach, sachBanYeuThich, sachMienPhiYeuThich, hoadon, cb) {
  var khachThamQuan_Details = { 
    Email: email,
    CMND: cmnd,
    MatKhau: matkhau,
    TenHienThi: tenhienthi 
  };
  if (the != false) khachThamQuan_Details.The = the
  if (lstimkiem != false) khachThamQuan_Details.lsTimKiem = lstimkiem
  if (lsdocsach != false) khachThamQuan_Details.lsDocSach = lsdocsach
  if (sachBanYeuThich != false) khachThamQuan_Details.SachBanYeuThich = sachBanYeuThich
  if (sachMienPhiYeuThich != false) khachThamQuan_Details.SachMienPhiYeuThich = sachMienPhiYeuThich
  if (hoadon != false) khachThamQuan_Details.HoaDon = hoadon

  var khachThamQuan = new KhachThamQuan(khachThamQuan_Details);   
  khachThamQuan.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New KhachThamQuan: ' + khachThamQuan);
    KhachThamQuan_Data.push(khachThamQuan)
    cb(null, khachThamQuan)
  }  );
}


function TacGiaCreate(email, cmnd, matkhau, tenhienthi, the, 
  lstimkiem, lsdocsach, sachBanYeuThich, sachMienPhiYeuThich, hoadon, cb) {
  var tacGia_Details = { 
    Email: email,
    CMND: cmnd,
    MatKhau: matkhau,
    TenHienThi: tenhienthi 
  };
  if (the != false) tacGia_Details.The = the
  if (lstimkiem != false) tacGia_Details.lsTimKiem = lstimkiem
  if (lsdocsach != false) tacGia_Details.lsDocSach = lsdocsach
  if (sachBanYeuThich != false) tacGia_Details.SachBanYeuThich = sachBanYeuThich
  if (sachMienPhiYeuThich != false) tacGia_Details.SachMienPhiYeuThich = sachMienPhiYeuThich
  if (hoadon != false) tacGia_Details.HoaDon = hoadon

  var tacGia = new TacGia(tacGia_Details);   
  tacGia.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New TacGia: ' + tacGia);
    TacGia_Data.push(tacGia)
    cb(null, tacGia)
  }  );
}


function DanhGiaCreate(rate, thoiDiem, cb) {
  var danhGia = new DanhGia({ Rate: rate, ThoiDiem: thoiDiem });

  danhGia.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New DanhGia: ' + danhGia);
    DanhGia_Data.push(danhGia)
    cb(null, danhGia)
  }  );
}

function BinhLuanCreate(noiDung, thoiDiem, nguoiDung, cb) {
  var binhLuan = new BinhLuan({ NoiDung: noiDung, ThoiDiem: thoiDiem, NguoiDung: nguoiDung });

  binhLuan.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New BinhLuan: ' + binhLuan);
    BinhLuan_Data.push(binhLuan)
    cb(null, binhLuan)
  }  );
}

function LichSuDocSachCreate(trang, thoiDiem, sach, cb) {
  var lsds = new LichSuDocSach({ Trang: trang, ThoiDiem: thoiDiem, SachMienPhi: sach });

  lsds.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New LichSuDocSach: ' + lsds);
    LichSuDocSach_Data.push(lsds)
    cb(null, lsds)
  }  );
}

function LichSuTimKiemCreate(chuoiTimKiem, thoiDiem, cb) {
  var lstk = new LichSuTimKiem({ ChuoiTimKiem: chuoiTimKiem, ThoiDiem: thoiDiem });

  lstk.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New LichSuTimKiem: ' + lstk);
    LichSuTimKiem_Data.push(lstk)
    cb(null, lstk)
  }  );
}

function TheTinDungCreate(chuthe, mathe, ngayhethan, loaithe, cb) {
  var theTinDung = new TheTinDung({ ChuThe: chuthe, MaThe: mathe, NgayHetHan: ngayhethan, LoaiThe: loaithe });

  theTinDung.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New TheTinDung: ' + theTinDung);
    TheTinDung_Data.push(theTinDung)
    cb(null, theTinDung)
  }  );
}

function TheLoaiCreate(ten,cb){
  var theLoai = new TheLoai({Ten : ten});
  theLoai.save((err)=>{
    if(err){
      cb(err,null);
      return;
    }
    console.log('New TheLoai: ' + theLoai);
    TheLoai_Data.push(theLoai);
    cb(null,theLoai);
  })
}

function SachBanCreate(MaSach,TuaDe,HinhAnh,GioiThieu,Gia,TheLoai,TacGia,cb){
  var sachBan = new SachBan(
    {
      MaSach,TuaDe,HinhAnh,GioiThieu,Gia,
      TheLoai : [TheLoai._id],TacGia : TacGia._id
    })
    sachBan.save((err)=>{
      if(err){
        cb(err,null);
        return;
      }
      console.log('New SachBan: ' + sachBan);
      SachBan_Data.push(sachBan);
      cb(null,sachBan);
    })

}


function SachMienPhiCreate(MaSach,TuaDe,HinhAnh,GioiThieu,TheLoai,TacGia,cb){
  var sachMienPhi = new SachMienPhi(
    {
      MaSach,TuaDe,HinhAnh,GioiThieu,
      TheLoai : [TheLoai._id],TacGia : TacGia._id
    })
    sachMienPhi.save((err)=>{
      if(err){
        cb(err,null);
        return;
      }
      console.log('New SachMienPhi: ' + sachMienPhi);
      SachMienPhi_Data.push(sachMienPhi);
      cb(null,sachMienPhi);
    })

}


// == Create Collection's Data ==================================================
//  * Chú thích: Format Date == "yyyy-mm-dd"

function createSachBan_Data(cb){
  async.parallel([
    function(callback){
      SachBanCreate("ISBN123","Harry Potter","./public/images/hp.png","Fantasy book",200000,
        TheLoai_Data[2],TacGia_Data[1],callback);
    },
    function(callback){
      SachBanCreate("ISBN123","Clean Code","./public/images/cd.png","Progarmming book",250000,
        TheLoai_Data[1],TacGia_Data[0],callback);
    }
  ],cb);
}

function createMienPhi_Data(cb){
  async.parallel([
    function(callback){
      SachMienPhiCreate("ISBN1223","Free Book","./public/images/fb.png","Free book",
        TheLoai_Data[0],TacGia_Data[2],callback);
    }
  ],cb);
}

function createTheLoai_Data(cb){
  async.parallel([
    function(callback){
      TheLoaiCreate("Education",callback);
    },function(callback){
      TheLoaiCreate("Programing",callback);
    },function(callback){
      TheLoaiCreate("Fantasy",callback);
    }
  ],cb);
}

function createTacGia_Data(cb) {
  async.parallel([
    function(callback) {
      TacGiaCreate("RoberCMartin@gmail.com", "6242424124", "robert123", "Rober C.Martin", false, false, false, false, false, false, callback);
    },
    function(callback) {
      TacGiaCreate("JKRolwing@gmail.com", "6336262352", "JKRolwing123", "J.K.Rolwing", TheTinDung_Data[1], false, false, false, false, false, callback);
    },
    function(callback) {
      TacGiaCreate("somedude@gmail.com", "635322", "dude123", "Some Dude", false, false, false, false, false, false, callback);
    }
    ],
    // optional callback
    cb);
}

function createKhachThamQuan_Data(cb) {
  async.parallel([
    function(callback) {
      KhachThamQuanCreate("teo@gmail.com", "4236748291", "teo123", "teo", false, false, false, false, false, false, callback);
    },
    function(callback) {
      KhachThamQuanCreate("duy@gmail.com", "1234567890", "matkhaufacebookne", "duyduy", TheTinDung_Data[0], false, false, false, false, false, callback);
    },
    ],
    // optional callback
    cb);
}

function createTheTinDung_Data(cb) {
  async.parallel([
    function(callback) {
      TheTinDungCreate("Duy", "41236375968264852", "2020-05-27", "Visa", callback);
    },
    function(callback) {
      TheTinDungCreate("Rowling", "4123632528264852", "2020-09-24", "Master Card", callback);
    }
    ],
    // optional callback
    cb);
}

function createDanhGia_Data(cb) {
  async.parallel([
    function(callback) {
      DanhGiaCreate(4, '2017-07-07', callback);
    },
    function(callback) {
      DanhGiaCreate(5, '2017-07-07', callback);
    },
    function(callback) {
      DanhGiaCreate(4, '2017-07-07', callback);
    },
    function(callback) {
      DanhGiaCreate(4, '2017-07-07', callback);
    },
    function(callback) {
      DanhGiaCreate(3, '2017-07-07', callback);
    },
    function(callback) {
      DanhGiaCreate(4, '2017-07-07', callback);
    },
    ],
    // optional callback
    cb);
}

function createBinhLuan_Data(cb) {
  async.parallel([
    function(callback) {
      BinhLuanCreate('Good!', '2017-07-07', {type: 'KhachThamQuan', item: KhachThamQuan_Data[0]}, callback);
    },
    function(callback) {
      BinhLuanCreate('Awesome', '2017-07-07', {type: 'KhachThamQuan', item: KhachThamQuan_Data[1]}, callback);
    },
    function(callback) {
      BinhLuanCreate('Great!', '2017-07-07', {type: 'KhachThamQuan', item: KhachThamQuan_Data[1]}, callback);
    },
    function(callback) {
      BinhLuanCreate('Just Okay', '2017-07-07', {type: 'TacGia', item: KhachThamQuan_Data[0]}, callback);
    },
    function(callback) {
      BinhLuanCreate('Very Deep', '2017-07-07', {type: 'TacGia', item: KhachThamQuan_Data[1]}, callback);
    },
    ],
    // optional callback
    cb);
}

function createLichSuDocSach_Data(cb) {
  async.parallel([
    function(callback) {
      LichSuDocSachCreate(120, '2017-07-07', SachMienPhi_Data[0], callback);
    },
    ],
    // optional callback
    cb);
}

function createLichSuTimKiem_Data(cb) {
  async.parallel([
    function(callback) {
      console.log('TimKiem');
      LichSuTimKiemCreate('Harry', '2017-07-07', callback);
    },
    ],
    // optional callback
    cb);
}


// == Main ===========================
// ** Chú ý: Do đây là data phát sinh nên cần phát sinh theo thứ tự (VD: Từ TheTinDung xong tới KhachThamQuan)
async.series([
    createTheTinDung_Data,
    createKhachThamQuan_Data,
    createTacGia_Data,
    createDanhGia_Data,
    createBinhLuan_Data,
    createTheLoai_Data,
    createSachBan_Data,
    createMienPhi_Data,
    createLichSuDocSach_Data,
    createLichSuTimKiem_Data
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Success');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




