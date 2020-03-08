var mongoose = require('mongoose');
var mongoDB = '';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var async = require('async')

var fs = require('fs')
const TacGia = require('./models/TacGia');
const SachBan = require('./models/SachBan');
const TheLoai = require('./models/TheLoai');


var listOfTasks= [];

fs.readdirSync("book_data").forEach(file => {
    var data= fs.readFileSync("book_data/" + file, 'utf8');

    var obj = JSON.parse(data);
    obj = obj.Sach;
    var theloais = obj.TheLoai.split("/");
    async function createSach() {
        var TheLoaiIDs = [];
        var TacGiaID;
        TacGiaID = await getTacGiaID(obj.TacGia);
        for (i = 0; i < theloais.length; i++) {
            TheLoaiIDs[i] = await getTheLoaiID(theloais[i]);
        }
        SachBan.create(
            {
                MaSach: obj.MaSach,
                TuaDe: obj.TuaDe,
                HinhAnh: obj.HinhAnh,
                GioiThieu: "Blank",
                Gia: obj.Gia,
                TacGia: TacGiaID,
                TheLoai: TheLoaiIDs
            }
	).then((res)=>{
        console.log(file);
    }).catch(err=>{
		console.log("err");
	})
    }
    listOfTasks.push(createSach);
});


async.series(listOfTasks, function(err, res) {
})





async function getTheLoaiID(tenTheLoai) {
    return new Promise((resolve, reject) => {
        TheLoai.findOne(
            { "Ten": { "$regex": tenTheLoai, "$options": "i" } }
        ).then(res => {
            if (res === false || res === undefined || res === null) {
                var newTL = new TheLoai({
                    Ten: tenTheLoai
                });
                newTL.save().then(data => {
                    resolve(data._id.toHexString());
                })
                return;
            }
            resolve(res._id.toHexString());
        }).catch(err => {
            console.log(err);
        })
    });
}

async function getTacGiaID(tenTacGia) {
    return new Promise((resolve, reject) => {
        TacGia.findOne(
            { "Ten": { "$regex": tenTacGia, "$options": "i" } }
        ).then((res) => {
            if (res === null || res === false || res === undefined) {
                var newTG = new TacGia({
                    Ten: tenTacGia
                });
                newTG.save().then((data) => {
                    resolve(data._id.toHexString());
                })
            } else {
                resolve(res._id.toHexString());
            }
        }).catch(err => {
            console.log(err);
        })
    })
}