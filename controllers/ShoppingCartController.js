var SachBan = require('../models/SachBan')

function tinhTongSoTien(cart){
    var total = 0;
    for(var i = 0 ; i < cart.length;i++){
        total += cart[i].book.Gia*cart[i].soluong;
    }
    return total;
}

exports.addBook= (req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    var cart= req.session.shoppingcart;
    if(cart === undefined){
        cart = [];
    }
    var book_id = req.params.book_id;

    for(var i = 0 ; i < cart.length;i++){
        if(cart[i].book._id === book_id){
            cart[i].soluong++;
            req.session.shoppingcart = cart;
            res.send(JSON.stringify({
                error : false,
                book_id,
                soluong : cart[i].soluong,
                tongtien : tinhTongSoTien(cart)
            }))
            return;
        }
    }

    SachBan.findById(book_id).then((book)=>{
        if(res === undefined || res === null){
            return Promise.reject();
        }
        cart.push({
            book,
            soluong : 1
        })
        req.session.shoppingcart = cart;
        res.send(JSON.stringify({
            error : false,
            book : book,
            tongtien : tinhTongSoTien(cart)
        }))
        
    }).catch((err)=>{
        res.send(JSON.stringify({
            error : true
        }))
    })
}

exports.removeFromCart=(req,res,next)=>{
    res.setHeader('Content-Type', 'application/json');

    var cart= req.session.shoppingcart;
    if(cart === undefined){
        res.send(JSON.stringify({
            error : false,
            tongtien : 0
        }));
    }
    var book_id = req.params.book_id;

    for(var i = 0 ; i < cart.length;i++){
        if(cart[i].book._id === book_id){
            cart.splice(i,1);
            req.session.shoppingcart = cart;
            res.send(JSON.stringify({
                error : false,
                tongtien : tinhTongSoTien(cart)
            }))
            return;
        }
    }
}

exports.increaseItem = (req,res,next)=>{
    res.setHeader('Content-Type', 'application/json');

    var cart= req.session.shoppingcart;
    if(cart === undefined){
        res.send(JSON.stringify({
            error : false,
            tongtien : 0
        }));
    }
    var book_id = req.params.book_id;

    for(var i = 0 ; i < cart.length;i++){
        if(cart[i].book._id === book_id){
            cart[i].soluong++;
            req.session.shoppingcart = cart;
            res.send(JSON.stringify({
                error : false,
                soluong :  cart[i].soluong,
                tongtien : tinhTongSoTien(cart)
            }))
            return;
        }
    }

}

exports.descreaseItem = (req,res,next)=>{
    res.setHeader('Content-Type', 'application/json');

    var cart= req.session.shoppingcart;
    if(cart === undefined){
        return;
    }
    var book_id = req.params.book_id;
    console.log(book_id);
    for(var i = 0 ; i < cart.length;i++){
        if(cart[i].book._id === book_id){
            cart[i].soluong--;
            if(cart[i].soluong <= 0){
                cart.splice(i,1);
                res.send(JSON.stringify({
                    error : false,
                    soluong :  0,
                    tongtien : tinhTongSoTien(cart)
                }))
            }else{
                res.send(JSON.stringify({
                    error : false,
                    soluong :  cart[i].soluong,
                    tongtien : tinhTongSoTien(cart)
                }))
            }
            req.session.shoppingcart = cart;
           
            return;
        }
    }

}