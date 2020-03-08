var express = require('express');
var router = express.Router();

var NguoiDungController = require('../controllers/NguoiDungController');
var AuthenMiddleware = require('../middleware/authenticate');


// Create
router.get('/create',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_create_get);
router.post('/create',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_create_post);

// Delete
router.get('/:id/delete',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_delete_get);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_delete_post);

// Update
router.get('/:id/update',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_update_get);
router.post('/:id/update',AuthenMiddleware.isAdminMiddleware, NguoiDungController.user_update_post);

// Change info
router.get('/:id/change_info',AuthenMiddleware.isAuthorized, NguoiDungController.user_change_info_get);
router.post('/:id/change_info',AuthenMiddleware.isAuthorized, NguoiDungController.user_change_info_post);

// Change password
router.get('/:id/change_password',AuthenMiddleware.isAuthorized, NguoiDungController.user_change_password_get);
router.post('/:id/change_password',AuthenMiddleware.isAuthorized, NguoiDungController.user_change_password_post);

//get bills
router.get('/:id/bills',AuthenMiddleware.isAuthorized, NguoiDungController.user_bills_get);

//get searchs
router.get('/:id/searchs',AuthenMiddleware.isAuthorized, NguoiDungController.user_search_get);
router.post('/:id/searchs/:sid/delete',AuthenMiddleware.isAuthorized, NguoiDungController.user_search_delete);

// GET request for One.
router.get('/:id',AuthenMiddleware.isAuthorized, NguoiDungController.user_detail);

module.exports = router;