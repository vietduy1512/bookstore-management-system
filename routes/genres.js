var express = require('express');
var router = express.Router();

var TheLoaiController = require('../controllers/TheLoaiController');
const theLoai = require('./../middleware/theloai');
var AuthenMiddleware = require('../middleware/authenticate');


// GET request for All.
router.get('/', TheLoaiController.genre_list);

// Create
router.get('/create',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_create_get);
router.post('/create',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_create_post);

// Delete
router.get('/:id/delete',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_delete_get);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_delete_post);

// Update
router.get('/:id/update',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_update_get);
router.post('/:id/update',AuthenMiddleware.isAdminMiddleware, TheLoaiController.genre_update_post);

// GET request for One.
router.get('/:genre_id',theLoai, TheLoaiController.book_list_of_genre);

module.exports = router;