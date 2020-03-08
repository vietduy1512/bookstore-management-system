function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}

function dateFormat(date) {
    return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " "
        + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function renderRating(rate) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
        html += '<span class="fa fa-star ';
        if (i <= rate)
            html += 'star-checked';
        html += '"></span>';
    }
    return html;
}

window.onbeforeunload = function () {
    sessionStorage.setItem("TieuDeBL", $('#TieuDeBL').val());
    sessionStorage.setItem("NoiDungBL", $('#NoiDungBL').val());
    for (var i = 1; i <= 5; i++) {
        if ($("#star-" + i).is(":checked") === true) {
            sessionStorage.setItem("RateBL", i);
            break;
        }
    }
}

var html = '<div class="panel panel-white post container rating-item"><div class="row">\
<div class="col-md-3 text-center">\
<img src="http://bootdey.com/img/Content/user_1.jpg" class="rounded-circle mt-2" alt="user profile image">\
<div><a href="#"><b>:TenNguoiDung</b></a></div>\
<h6 class="text-muted time">:ThoiDiem</h6></div>\
<div class="col-md-9 comment">\
<h3>:TieuDe</h3>\
<div>:ratingHTML</div>\
<p>:NoiDung</p></div></div></div>';

$(document).ready(function () {

    var TieuDeBL = sessionStorage.getItem("TieuDeBL");
    if (TieuDeBL !== undefined) $('#TieuDeBL').val(TieuDeBL);
    var NoiDungBL = sessionStorage.getItem("NoiDungBL");
    if (NoiDungBL !== undefined) $('#NoiDungBL').val(NoiDungBL);
    var RateBL = sessionStorage.getItem("RateBL");
    console.log(RateBL);
    if (RateBL !== undefined) $('#star-' + RateBL).attr('checked', 'checked');

    $('#comment_form').hide();

    $('#comment_form').on('submit', function (e) {
        event.preventDefault();
        var formArray = $('#comment_form').serializeArray();
        var obj = objectifyForm(formArray);
        console.log(obj);
        if (obj.Rate === undefined) {
            $('#comment_notify').addClass("bg-danger").html("Chọn Số Sao Để Đánh Giá");
            return;
        } else {
            $('#comment_notify').removeClass("bg-danger").html("");
            obj.Rate = Number.parseInt(obj.Rate);
        }


        $.ajax({
            url: '/rating',
            method: 'Post',
            data: obj,
            success: function (res) {
                console.log(res);
                if (res.authenRequire) {
                    $('#login_notify').addClass("bg-danger").html("Bạn Phải Đăng Nhập Trước");
                    $('#login-modal').modal();
                } else if (res.err) {
                    $('#comment_notify').addClass("bg-danger").html(res.errMsg);
                } else {
                    var html_ = html;
                    html_ = html_.replace(':TenNguoiDung', res.TenNguoiDung);
                    html_ = html_.replace(':ThoiDiem', dateFormat(new Date(res.BinhLuan.ThoiDiem)));
                    html_ = html_.replace(':TieuDe', res.BinhLuan.TieuDe);
                    html_ = html_.replace(':NoiDung', res.BinhLuan.NoiDung);
                    html_ = html_.replace(':ratingHTML', renderRating(res.BinhLuan.Rate));
                    $('#comment_box_plh').after(html_);
                    $('#comment_form').find("input[type=text], textarea").val("");
                }
            }
        })
    })


    $('#add_rating_btn').on('click', function (e) {
        $('#comment_form').show();
    })

    var commentTimes = document.getElementsByClassName('time');
    console.log(commentTimes);
    for (var i = 0; i < commentTimes.length; i++) {
        var date = new Date(commentTimes[i].innerHTML);
        commentTimes[i].innerHTML = dateFormat(date);
    }


    $('#comment_box').on('scroll', function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            var comments = $('#comment_box .rating-item');
            var length = comments.length;
            var bookId = $('input[name=SachID]').val();

            $.ajax({
                url: "../rating/" + bookId + "/" + length,
                method: 'Get',
                success: function (res) {
                    console.log(res);
                    var lastComment = comments[length - 1];

                    var totalhtml = "";
                    for (var i = 0; i < res.length; i++) {
                        var html_ = html;
                        html_ = html.replace(':TenNguoiDung', res[i].NguoiDung.TenHienThi);
                        html_ = html_.replace(':ThoiDiem', dateFormat(new Date(res[i].ThoiDiem)));
                        html_ = html_.replace(':TieuDe', res[i].TieuDe);
                        html_ = html_.replace(':NoiDung', res[i].NoiDung);
                        html_ = html_.replace(':ratingHTML', renderRating(res[i].Rate));
                        totalhtml += html_;
                    }
                    lastComment.insertAdjacentHTML('afterend', totalhtml);
                }
            })

        }
    })
})