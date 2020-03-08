var mongoose = require('mongoose');
var DateUtils = require('../utils/DateUtills');

var Schema = mongoose.Schema;

var LichSuTimKiemSchema = new Schema(
  {
    ChuoiTimKiem: { type: String, required: true, max: 200 }, //type ?
    URL: { type: String, required: true, max: 200 }, //type ?
    ThoiDiem: { type: Date, default: new Date() }
  },
  { collection: 'LichSuTimKiem' }
);

LichSuTimKiemSchema
  .virtual('url')
  .get(function () {
    return '/books' + this.URL;
  });

LichSuTimKiemSchema
  .virtual('shortURL')
  .get(function () {
    if(this.URL.length > 25){
      return this.URL.substring(0,25)+"..."
    }
    return this.URL;
  });

LichSuTimKiemSchema.virtual('ThoiGian').get(function () {
  var date = this.ThoiDiem;
  return DateUtils.formatDateTime(date);
})

LichSuTimKiemSchema.virtual('Time').get(function () {
  var date = this.ThoiDiem;
  return date.getTime();
})

//Export model
module.exports = mongoose.model('LichSuTimKiem', LichSuTimKiemSchema);