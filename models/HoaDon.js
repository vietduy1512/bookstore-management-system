var mongoose = require('mongoose');
var DateUtils = require('../utils/DateUtills');

var Schema = mongoose.Schema;

var HoaDonSchema = new Schema(
  {
    ChiTiet: [
      {
        Book: { type: Schema.Types.ObjectId, ref: 'SachBan', required: true },
        SoLuong: { type: Number, required: true, min: 1 }
      }
    ],
    ThoiDiem: { type: Date, default: new Date() },
    Gia: { type: Number, required: true, min: 1 },
    NguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    VanChuyen: {
      Loai: {
        type: String,
        required: true,
        enum: ['TieuChuan', 'Nhanh'],
        default: 'TieuChuan'
      },
      HoTen: { type: String, required: true, trim: true, max: 60 },
      SoDT: { type: String, required: true },
      DiaChi: { type: String, required: true, trim: true, max: 200 }
    },
    ThanhToan: {
      Loai: {
        type: String,
        required: true,
        enum: ['COD', 'CreditCard'],
        default: 'COD'
      },
      MaThe: { type: Number },
      TenChuThe: { type: String, trim: true, max: 30 },
      NgayHetHan: { type: String, trim: true, max: 10 }
    },
    TinhTrang: {
      type: String,
      required: true,
      enum: ['DangGiao', 'DaGiao', 'ChuaGiao'],
      default: 'ChuaGiao'
    }
  },
  { collection: 'HoaDon' }
);

HoaDonSchema.virtual('url').get(function () {
  return "/checkout/"+this._id;
})

HoaDonSchema.methods.changeStatus = function (status) {
  var hoadon = this;
  hoadon.TinhTrang = status;
  return hoadon.save();
}

HoaDonSchema.virtual('ThoiGian').get(function () {
  var date = this.ThoiDiem;
  return DateUtils.formatDateTime(date);
})

HoaDonSchema.virtual('Time').get(function () {
  var date = this.ThoiDiem;
  return date.getTime();
})

HoaDonSchema.virtual('GetTinhTrang').get(function () {
  var tt = this.TinhTrang;
  if (tt === "DangGiao")
    return "Đang Giao";
  if (tt === "DaGiao")
    return "Đã Giao";
  if (tt === "ChuaGiao")
    return "Chưa Giao";
})



HoaDonSchema.statics.getThongKeByBook = function (hoadons) {
  var bookMap = new Map(); //thong ke theo sach
  for (var i = 0; i < hoadons.length; i++) {
    var cts = hoadons[i].ChiTiet;
    for (var j = 0; j < cts.length; j++) {
      var ct = cts[j];
      var bookIns = bookMap.get(ct.Book);
      if (!bookIns) {
        bookMap.set(ct.Book, ct.SoLuong)
      } else {
        bookIns.set(ct.Book, bookIns + ct.SoLuong);
      }
    }
  }
  var bookArr = [];
  bookMap.forEach((val, key) => {
    bookArr.push({
      Book: key,
      SoLuong: val
    })
  })

  return bookArr;

}

HoaDonSchema.statics.getThongKeByTime = function (hoadons) {
  var HoaDon = this;
  var monthMap = new Map();//thong ke theo thang
  var yearMap = new Map(); //thong ke theo nam
  var dateMap = new Map();//thong ke theo ngay
  var weekMap = new Map(); //thong ke theo tuan
  var quarterMap = new Map();//thong ke theo quy



  for (var i = 0; i < hoadons.length; i++) {
    var hd = hoadons[i];
    var date = DateUtils.getDateFormat(hd.ThoiDiem);
    var month = DateUtils.getMonthFormat(hd.ThoiDiem);
    var year = hd.ThoiDiem.getFullYear().toString();
    var week = DateUtils.getWeekFormat(hd.ThoiDiem);
    var quarter = DateUtils.getQuaterFormat(hd.ThoiDiem);

    var dateInst = dateMap.get(date);
    var weekInst = weekMap.get(week);
    var monthInst = monthMap.get(month);
    var quarterInst = quarterMap.get(quarter);
    var yearInst = yearMap.get(year);

    if (!monthInst) {
      monthMap.set(month, {
        SoLuong: 1,
        SoTien: hd.Gia
      })
    } else {
      monthInst.SoLuong++;
      monthInst.SoTien += hd.Gia
    }

    if (!yearInst) {
      yearMap.set(year, {
        SoLuong: 1,
        SoTien: hd.Gia
      })
    } else {
      yearInst.SoLuong++;
      yearInst.SoTien += hd.Gia
    }

    if (!weekInst) {
      weekMap.set(week, {
        SoLuong: 1,
        SoTien: hd.Gia
      })
    } else {
      weekInst.SoLuong++;
      weekInst.SoTien += hd.Gia
    }

    if (!dateInst) {
      dateMap.set(date, {
        SoLuong: 1,
        SoTien: hd.Gia
      })
    } else {
      dateInst.SoLuong++;
      dateInst.SoTien += hd.Gia
    }

    if (!quarterInst) {
      quarterMap.set(quarter, {
        SoLuong: 1,
        SoTien: hd.Gia
      })
    } else {
      quarterInst.SoLuong++;
      quarterInst.SoTien += hd.Gia
    }
  }

  var dateArr = [];
  var weekArr = [];
  var quarterArr = [];
  var monthArr = [];
  var yearArr = [];

  monthMap.forEach((val, key) => {
    monthArr.push({
      Month: key,
      SoLuong: val.SoLuong,
      SoTien: val.SoTien,
      Number: DateUtils.ortherFormatToInt(key)
    })
  })

  yearMap.forEach((val, key) => {
    yearArr.push({
      Year: key,
      SoLuong: val.SoLuong,
      SoTien: val.SoTien,
      Number: Number.parseInt(key)
    })
  })

  weekMap.forEach((val, key) => {
    weekArr.push({
      Week: key,
      SoLuong: val.SoLuong,
      SoTien: val.SoTien,
      Number: DateUtils.ortherFormatToInt(key)
    })
  })

  dateMap.forEach((val, key) => {
    dateArr.push({
      Date: key,
      SoLuong: val.SoLuong,
      SoTien: val.SoTien,
      Number: DateUtils.dateToInt(key)
    })
  })

  quarterMap.forEach((val, key) => {
    quarterArr.push({
      Quarter: key,
      SoLuong: val.SoLuong,
      SoTien: val.SoTien,
      Number: DateUtils.ortherFormatToInt(key)
    })
  })

  return {
    Month: monthArr,
    Year: yearArr,
    Date: dateArr,
    Week: weekArr,
    Quarter: quarterArr
  }
}




//Export model
module.exports = mongoose.model('HoaDon', HoaDonSchema);