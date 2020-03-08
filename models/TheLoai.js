const mongoose = require('mongoose');


const TheLoaiSchema = new mongoose.Schema({
    Ten : {type : String , required : true , trim : true }
}, { collection: 'TheLoai' });


// Virtual for book's URL
TheLoaiSchema
.virtual('url')
.get(function () {
    return '/genres/' + this._id;
});


module.exports = mongoose.model("TheLoai",TheLoaiSchema);