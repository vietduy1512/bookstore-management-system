var express = require('express');
var router = express.Router();
var DanhGiaController = require('../controllers/DanhGiaController');
var AuthenMiddleware = require('../middleware/authenticate');


router.post('/', DanhGiaController.rating_create);
router.get('/:bookId/:number', DanhGiaController.get_more_rating_of_book);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, DanhGiaController.rating_delete_post);


module.exports = router;
