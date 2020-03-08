var express = require('express');
var router = express.Router();

var AuthenMiddleware = require('../middleware/authenticate');
var QuanLyController = require('../controllers/QuanLyController');



// Login
router.get('/login',AuthenMiddleware.isNotAuthenMiddleware,QuanLyController.admin_login_get);
router.post('/login',AuthenMiddleware.isNotAuthenMiddleware, QuanLyController.admin_login_post);

// GET request for All.
router.get('/',AuthenMiddleware.isAdminMiddleware,QuanLyController.admin_dashboard);
router.get('/statistics',AuthenMiddleware.isAdminMiddleware, QuanLyController.get_thongke_page);

router.get('/book_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_book_list);
router.get('/genre_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_genre_list);
router.get('/author_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_author_list);
router.get('/user_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_user_list);
router.get('/admin_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_admin_list);
router.get('/rating_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_rating_list);


router.get('/checkout_list',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_checkout_list);
router.post('/checkout/:id/tinhtrang',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_change_checkout_status);


// Create
router.get('/create',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_create_get);
router.post('/create',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_create_post);

// Delete
router.get('/:id/delete',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_delete_get);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_delete_post);

// Update
router.get('/:id/update',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_update_get);
router.post('/:id/update',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_update_post);

// GET request for One.
router.get('/:admin_id',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_detail);

router.post('/:id/Role/:role',AuthenMiddleware.isAdminMiddleware, QuanLyController.admin_change_role);

module.exports = router;