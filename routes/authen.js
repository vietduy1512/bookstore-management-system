var express = require('express');
var router = express.Router();
const AuthenController = require('./../controllers/AuthenController');
const theLoai = require('./../middleware/theloai');
var AuthenMiddleware = require('../middleware/authenticate');


router.post('/login',AuthenMiddleware.isNotAuthenMiddleware,AuthenController.login);
router.post('/register',AuthenMiddleware.isNotAuthenMiddleware,AuthenController.register);
router.post('/logout',AuthenMiddleware.isAuthenMiddleware,AuthenController.logout);
router.post('/active/resend/',AuthenMiddleware.isNotAuthenMiddleware,AuthenController.resendActiveEmail);
router.post('/forgotpassword/',AuthenMiddleware.isNotAuthenMiddleware,AuthenController.forgotpassword);
router.post('/resetpassword/:token',AuthenMiddleware.isNotAuthenMiddleware,AuthenController.resetPassword);


router.get('/active/:token',AuthenMiddleware.isNotAuthenMiddleware,theLoai,AuthenController.activeAccount);
router.get('/resetpassword/:token',AuthenMiddleware.isNotAuthenMiddleware,theLoai,AuthenController.getResetPasswordPage);


module.exports = router;
