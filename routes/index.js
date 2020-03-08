var express = require('express');
var router = express.Router();
const theLoai = require('./../middleware/theloai');

var HomeController = require('../controllers/HomeController');

/* GET home page. */
router.get('/',theLoai, HomeController.index);

module.exports = router;
