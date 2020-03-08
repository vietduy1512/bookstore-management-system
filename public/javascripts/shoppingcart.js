$(document).ready(function () {

    $('#shoppingcart-btn').on('click', function (e) {
        $('#shoppingcart-modal').modal('show');
    });

    $('#add-shopping-cart-btn').on('click', function (e) {
        e.preventDefault();
        var html = '<div class="row" id="cart-item-:bookId"><div class="col-md-2 text-center">\
          <img src="/:hinhAnh" alt="" class="img-responsive"></div>\
            <div class="col-md-6"><h5>:tuaDe</h5> <button class="btn btn-light" onclick="deleteItem(this)" value=":bookId">Xóa</button></div>\
            <div class="col-md-2 text-center"><h5>:Gia ₫</h5></div>\
            <div class="col-md-2 text-center">\
          <button class="btn btn-light" onclick="descItem(this)" value=":bookId">-</button>\
          <span id="number-count-:bookId">1</span>\
          <button class="btn btn-light" onclick="incItem(this)" value=":bookId">+</button></div></div>'
        var book_id = $('#add-shopping-cart-btn').prop('value');
        $.ajax({
            url: '/cart/' + book_id,
            type: 'POST',
            success: function (res) {
                console.log(res);
                if (!res.err) {
                    $('#total-money').text(res.tongtien + ' ₫');
                    if (res.book === undefined) {
                        $('#number-count-' + res.book_id).text(res.soluong);
                    } else {
                        html = html.replace(':hinhAnh', res.book.HinhAnh);
                        html = html.replace(':tuaDe', res.book.TuaDe);
                        html = html.replace(':Gia', res.book.Gia);
                        html = html.replace(':bookId', res.book._id);
                        html = html.replace(':bookId', res.book._id);
                        html = html.replace(':bookId', res.book._id);
                        html = html.replace(':bookId', res.book._id);
                        html = html.replace(':bookId', res.book._id);

                        $('#shopping-cart-body').append(html);
                        var number = Number.parseInt($('#cart-item-count').text());
                        $('#cart-item-count').text(number+1);
                    }
                    $('#shoppingcart-modal').modal('show');
                }
            }
        })
    })

})

function deleteItem(e) {
    var book_id = e.getAttributeNode("value").value;
    $.ajax({
        url: '/cart/' + book_id,
        type: 'DELETE',
        success: function (res) {
            if (!res.error) {
                var number = Number.parseInt($('#cart-item-count').text());
                $('#cart-item-count').text(number-1);

                $('#cart-item-' + book_id).remove();
                $('#total-money').text(res.tongtien + ' ₫');
            }
        }
    });
}

function descItem(e) {
    var book_id = e.getAttributeNode("value").value;
    $.ajax({
        url: '/cart/' + book_id + "/desc",
        type: 'PATCH',
        success: function (res) {
            if (!res.error) {
                $('#total-money').text(res.tongtien + ' ₫');

                if (res.soluong <= 0){
                    $('#cart-item-' + book_id).remove();
                    var number = Number.parseInt($('#cart-item-count').text());
                    $('#cart-item-count').text(number-1);
                }
                else
                    $('#number-count-' + book_id).text(res.soluong);
            }
        }
    });
}

function incItem(e) {
    var book_id = e.getAttributeNode("value").value;
    $.ajax({
        url: '/cart/' + book_id + "/inc",
        type: 'PATCH',
        success: function (res) {
            if (!res.error) {
                $('#number-count-' + book_id).text(res.soluong);
                $('#total-money').text(res.tongtien + ' ₫');
            }
        }
    });
}