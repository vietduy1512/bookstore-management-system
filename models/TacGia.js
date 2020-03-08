var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// TODO: xử lý Validation ...
var TacGiaSchema = new Schema(
  {
    Ten: {type: String, required: true, max: 20},
    NgaySinh: {type: Date},
    NgayMat: {type: Date}
  },
  { collection: 'TacGia' }
);

// Virtual for book's URL
TacGiaSchema
.virtual('url')
.get(function () {
    return '/authors/' + this._id;
});

function getNumberDateFommatt(number){
  if(number < 10){
    return '0'+number;
  }
  return number;
}

function updateDateFormatter(date){
  
  return date.getFullYear() + "-"+getNumberDateFommatt(date.getMonth())+"-"
    +getNumberDateFommatt(date.getDate());
}

TacGiaSchema.virtual('NgaySinhUpdateFormat').get(function(){
  return updateDateFormatter(this.NgaySinh)
})

TacGiaSchema.virtual('NgayMatUpdateFormat').get(function(){
  return updateDateFormatter(this.NgayMat)
})

//Export model
module.exports = mongoose.model('TacGia', TacGiaSchema);