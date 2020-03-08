var express = require('express');
var router = express.Router();
var CheckoutController = require("./../controllers/CheckoutController");
const theLoai = require('./../middleware/theloai');
var AuthenMiddleware = require('../middleware/authenticate');


router.get('/',theLoai,CheckoutController.getCheckoutPage);

router.post('/',CheckoutController.thanhToan);
router.get('/:id',theLoai,CheckoutController.get_details_page);
router.post('/:id/delete',AuthenMiddleware.isAdminMiddleware,CheckoutController.delete_checkout_post);


module.exports = router;