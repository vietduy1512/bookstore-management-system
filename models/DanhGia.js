var mongoose = require('mongoose');
var DateUtils = require('../utils/DateUtills');

var Schema = mongoose.Schema;

// Thường thì người dùng vào sách mới thấy bình luận nên sách sẽ lưu thuộc tính BinhLuan và BinhLuan ko cần lưu Sach
var DanhGiaSchema = new Schema(
  {
    Rate: {type: Number, required: true, min: 1, max: 5},
    TieuDe : {type: String, required: true, max: 80},
    NoiDung: {type: String, required: true, max: 200},
    ThoiDiem: {type: Date, default: new Date()},
    NguoiDung: {type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true},
    Sach: {type: Schema.Types.ObjectId, ref: 'SachBan', required: true}
  },
  { collection: 'DanhGia' }
);

DanhGiaSchema
  .virtual('shortNoiDung')
  .get(function () {
    if(this.NoiDung.length > 30){
      return this.NoiDung.substring(0,30)+"..."
    }
    return this.NoiDung;
  });

  DanhGiaSchema
  .virtual('shortTieuDe')
  .get(function () {
    if(this.TieuDe.length > 15){
      return this.TieuDe.substring(0,15)+"..."
    }
    return this.TieuDe;
  });



DanhGiaSchema.virtual('ThoiGian').get(function () {
  var date = this.ThoiDiem;
  return DateUtils.formatDateTime(date);
})

DanhGiaSchema.virtual('Time').get(function () {
  var date = this.ThoiDiem;
  return date.getTime();
})


//Export model
module.exports = mongoose.model('DanhGia', DanhGiaSchema);