var express = require('express');
var router = express.Router();
const theLoai = require('./../middleware/theloai');

var SachController = require('../controllers/SachController');
var AuthenMiddleware = require('../middleware/authenticate');


// GET request for All.
router.get('/',theLoai,SachController.book_list);

// GET request for Advance search for All.
router.get('/advance_search',theLoai,SachController.advance_search_book_list);

// Create
router.get('/create',AuthenMiddleware.isAdminMiddleware, SachController.book_create_get);
router.post('/create',AuthenMiddleware.isAdminMiddleware, SachController.book_create_post);

// Delete
router.get('/:id/delete',AuthenMiddleware.isAdminMiddleware, SachController.book_delete_get);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, SachController.book_delete_post);

// Update
router.get('/:id/update',AuthenMiddleware.isAdminMiddleware, SachController.book_update_get);
router.post('/:id/update',AuthenMiddleware.isAdminMiddleware, SachController.book_update_post);

// GET request for One.
router.get('/:book_id',theLoai,SachController.book_detail);

module.exports = router;