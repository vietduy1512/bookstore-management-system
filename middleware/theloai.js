var TheLoai = require('./../models/TheLoai');
var app = require('./../app');

module.exports =  (req, res, next)  =>{
    TheLoai.find({}).then((res) => {
        req.app.locals.theLoais = res;
        next();
    }).catch((err) => {
        console.log(err);
        req.app.locals.theLoais = [];
        next();
    })
}