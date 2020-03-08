var express = require('express');
var router = express.Router();

var TacGiaController = require('../controllers/TacGiaController');
const theLoai = require('./../middleware/theloai');
var AuthenMiddleware = require('../middleware/authenticate');


// GET request for All.
router.get('/', TacGiaController.author_list);

// Create
router.get('/create',AuthenMiddleware.isAdminMiddleware,TacGiaController.author_create_get);
router.post('/create',AuthenMiddleware.isAdminMiddleware, TacGiaController.author_create_post);

// Delete
router.get('/:id/delete',AuthenMiddleware.isAdminMiddleware, TacGiaController.author_delete_get);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, TacGiaController.author_delete_post);

// Update
router.get('/:id/update',AuthenMiddleware.isAdminMiddleware, TacGiaController.author_update_get);
router.post('/:id/update',AuthenMiddleware.isAdminMiddleware, TacGiaController.author_update_post);

// GET request for One.
router.get('/:author_id', theLoai,TacGiaController.author_detail);

module.exports = router;