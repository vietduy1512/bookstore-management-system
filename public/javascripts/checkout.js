function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}


window.onbeforeunload = function () {
    sessionStorage.setItem("hoten", $('#hoten').val());
    sessionStorage.setItem("sodt", $('#sodt').val());
    sessionStorage.setItem("tinhTP", $('#tinhTP').val());
    sessionStorage.setItem("quanHuyen", $('#quanHuyen').val());
    sessionStorage.setItem("phongXa", $('#phongXa').val());
    sessionStorage.setItem("diaChi", $('#diaChi').val());
    var hinhthucgh = $('input[name=hinhthucgh]:checked').val();
    sessionStorage.setItem("hinhthucgh", hinhthucgh);
    var hinhthuctt = $('input[name=hinhthuctt]:checked').val();
    sessionStorage.setItem("hinhthuctt",hinhthuctt);
    sessionStorage.setItem("soThe", $('#soThe').val());
    sessionStorage.setItem("tenThe", $('#tenThe').val());
    sessionStorage.setItem("ngayHetHan", $('#ngayHetHan').val());

}


$(document).ready(function() {
    var store = sessionStorage.getItem("hoten");
    if (store !== "undefined") $('#hoten').val(store);
    store = sessionStorage.getItem("sodt");
    if (store !== "undefined") $('#sodt').val(store);
    store = sessionStorage.getItem("tinhTP");
    if (store !== "undefined") $('#tinhTP').val(store);
    store = sessionStorage.getItem("quanHuyen");
    if (store !== "undefined") $('#quanHuyen').val(store);
    store = sessionStorage.getItem("phongXa");
    if (store !== "undefined") $('#phongXa').val(store);
    store = sessionStorage.getItem("diaChi");
    if (store !== "undefined") $('#diaChi').val(store);
    store = sessionStorage.getItem("soThe");
    if (store !== "undefined") $('#soThe').val(store);
    store = sessionStorage.getItem("tenThe");
    if (store !== "undefined") $('#tenThe').val(store);
    store = sessionStorage.getItem("ngayHetHan");
    if (store !== "undefined") $('#ngayHetHan').val(store);
    store = sessionStorage.getItem("hinhthucgh");
    if (store !== "undefined") $("input[name=hinhthucgh][value=" + store + "]").attr('checked', 'checked');
    store = sessionStorage.getItem("hinhthuctt");
    if (store !== "undefined"){
        $("input[name=hinhthuctt][value=" + store + "]").attr('checked', 'checked');
        if(store === 'CreditCard'){
            $('#credit-card-info').show();
            $('#credit-card-info input').prop('required',true);
        }else{
            $('#credit-card-info').hide();
        }
    }else{
        $('#credit-card-info').hide();
    } 



    $('input[type=radio][name=hinhthuctt]').change(function() {
        if (this.value === 'CreditCard') {
            $('#credit-card-info').show();
            $('#credit-card-info input').prop('required',true);
        }
        else {
            $('#credit-card-info').hide();
            $('#credit-card-info input').prop('required',false);
        }
    });

  

    $('input[type=radio][name=hinhthucgh]').change(function() {
        if (this.value === 'Nhanh') {
            $('#phiVC').text('20000');
            var soTien =  Number.parseInt($('#totalCart').text());
            var thue =  Number.parseInt($('#thue').text());
            $('#tongCong').text(soTien + thue +20000);

        }
        else {
            $('#phiVC').text('15000');
            var soTien =  Number.parseInt($('#totalCart').text());
            var thue =  Number.parseInt($('#thue').text());
            $('#tongCong').text(soTien + thue +15000);
        }
    });

    $('#form-checkout').on('submit',function(event){
        event.preventDefault();
        var formArray = $('#form-checkout').serializeArray();
        var obj = objectifyForm(formArray);
        
        $.ajax({
            url: '../checkout',
            method: 'POST',
            data: obj,
            success: function (res) {
                console.log(res);
                if (res.authenRequire) {
                    $('#login_notify').addClass("bg-danger").html("Bạn Phải Đăng Nhập Trước");
                    $('#login-modal').modal();
                }else if(res.err){
                    $('#Fail-Checkout').modal('show');
                }else{
                    $('#Success-Checkout').modal({backdrop: 'static', keyboard: false});                }
            }
        })

    })
});