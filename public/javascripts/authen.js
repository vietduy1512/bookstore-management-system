function CheckRetypePassword(input) {
    var password_rsg = document.getElementById('password_rsg');
    if (input.value != password_rsg.value) {
        input.setCustomValidity('Password Must be Matching.');
    } else {
        input.setCustomValidity('');
    }
}

function CheckRetypePasswordReset(input) {
    var password_rsg = document.getElementById('password_reset');
    if (input.value != password_rsg.value) {
        input.setCustomValidity('Password Must be Matching.');
    } else {
        input.setCustomValidity('');
    }
}


function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}




$(document).ready(function () {
    $('#login_form').on('submit', function (e) {
        event.preventDefault();
        var formArray = $('#login_form').serializeArray();
        var obj = objectifyForm(formArray);

        $.ajax({
            url: '/authen/login',
            method: 'Post',
            data: obj,
            success: function (result, status, xhr) {
                console.log(result);
                if (result.err === true) {
                    if (result.requestActive === true) {
                        $('#login-modal').modal('hide');
                        $('#email_resend_name').text(obj.email_login);
                        $('#require-active-modal').modal('show');
                        return;
                    }
                    $('#login_notify').addClass("bg-danger").html(result.message);
                } else {
                    $('#login_form').hide();
                    $('#login_notify').removeClass('bg-danger');
                    $('#login_notify').addClass("bg-success").html("Đăng Nhập Thành Công Đang Chuyển Hướng");
                    window.location.reload(false);
                }
            }
        })
    })


    $('#register_form').on('submit', function (e) {
        event.preventDefault();
        var formArray = $('#register_form').serializeArray();
        var obj = objectifyForm(formArray);
        $.ajax({
            url: '/authen/register',
            method: 'Post',
            data: obj,
            success: function (result, status, xhr) {
                if (result.err === true) {
                    $('#register_notify').addClass("bg-danger").html(result.message);
                } else {
                    $('#register_form').hide();
                    $('#register_notify').removeClass('bg-danger');
                    $('#register_notify').addClass("bg-success text-center").html("Đăng Ký Thành Công Đang Chuyển Hướng\
                        <br/>Hãy Kiểm Tra Email của bạn để kích  hoạt tài khoản");
                    setInterval(function () {
                        window.location.reload(false);
                    }, 3000);
                }
            }
        })
    })

    $('#logout_link').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/authen/logout',
            method: 'Post',
            success: function (result, status, xhr) {
                window.location.reload(false);
            }
        })
    })

    $('.switch_to_register').on('click', function (e) {
        e.preventDefault();
        $('#forgot-password-modal').modal('hide');
        $('#login-modal').modal('hide');
        $('#register-modal').modal('show');
    })

    $('.switch_to_login').on('click', function (e) {
        e.preventDefault();
        $('#forgot-password-modal').modal('hide');
        $('#register-modal').modal('hide');
        $('#login-modal').modal('show');
    })

    $('.switch_to_forgotpassword').on('click', function (e) {
        e.preventDefault();
        $('#register-modal').modal('hide');
        $('#login-modal').modal('hide');
        $('#forgot-password-modal').modal('show');
    })

    // Log in trong admin (Duy)
    $('#admin_login_form').on('submit', function (e) {
        e.preventDefault();
        var formArray = $('#admin_login_form').serializeArray();
        var obj = objectifyForm(formArray);

        $.ajax({
            url: '/admins/login',
            method: 'Post',
            data: obj,
            success: function (result, status, xhr) {
                if (result.err === true) {
                    $('#admin_login_notify').addClass("bg-danger").html(result.message);
                } else {
                    $('#admin_login_form').hide();
                    $('#admin_login_notify').removeClass('bg-danger');
                    $('#admin_login_notify').addClass("bg-success").html("Đăng Nhập Thành Công Đang Chuyển Hướng");
                    window.location.href = "/admins/";
                }
            }
        })
    })

    $('#resend_email').on('click', function (e) {
        e.preventDefault();
        var Email = $('#email_resend_name').text();
        $.ajax({
            url: '/authen/active/resend',
            method: 'Post',
            data: { Email },
            success: function (result, status, xhr) {
                console.log(result);
                if (result.err === true) {
                    $('#require-active-modal').modal('hide');
                    $('#failed-resend-modal').modal('show');
                } else {
                    $('#require-active-modal').modal('hide');
                    $('#success-resend-text').text('Gửi Lại Email Kích Hoạt Thành Công');
                    $('#success-resend-modal').modal('show');
                }
            }
        })
    })

    $('#forgotpassword_form').on('submit', function (e) {
        e.preventDefault();
        var formArray = $('#forgotpassword_form').serializeArray();
        var obj = objectifyForm(formArray);
        $.ajax({
            url: '/authen/forgotpassword',
            method: 'Post',
            data: obj,
            success: function (result, status, xhr) {
                console.log(result);
                if (result.err === true) {
                    if (result.message) {
                        $('#forgotpassword_notify').addClass("bg-danger").html(result.message);
                        return;
                    }
                    $('#forgot-password-modal').modal('hide');
                    $('#failed-resend-modal').modal('show');
                } else {
                    $('#forgot-password-modal').modal('hide');
                    $('#success-resend-text').text('Gửi Email Thành Công');
                    $('#success-resend-modal').modal('show');
                }
            }
        })
    })


    $('#resetpassword_form').on('submit', function (e) {
        e.preventDefault();
        var formArray = $('#resetpassword_form').serializeArray();
        var obj = objectifyForm(formArray);
        var href = window.location.href;
        $.ajax({
            url: href,
            method: 'POST',
            data: obj,
            success: function (result, status, xhr) {
                console.log(result);
                if (result.err === true) {
                    $('#resetpassword_notify').html(result.message);
                    return;
                } else {
                    $('#sucess-modal').modal({ backdrop: 'static', keyboard: false });
                }
            }
        })
    })
})
