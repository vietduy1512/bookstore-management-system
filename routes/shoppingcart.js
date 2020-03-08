var express = require('express');
var router = express.Router();
var shoppingCartController = require('../controllers/ShoppingCartController')





router.post('/:book_id',shoppingCartController.addBook)

router.patch('/:book_id/inc', shoppingCartController.increaseItem)

router.patch('/:book_id/desc', shoppingCartController.descreaseItem);

router.delete('/:book_id', shoppingCartController.removeFromCart);

module.exports = router;
