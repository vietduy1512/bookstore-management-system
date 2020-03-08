var nodemailer = require('nodemailer');
var fs = require('fs');
var Handlebars = require('handlebars');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ptudwth2015@gmail.com',
        pass: '@1997TeamWeb'
    }
});

var source = fs.readFileSync(__dirname + '/../views/email/checkoutmail.hbs', 'utf8');
var CheckoutTemplate = Handlebars.compile(source);

var source = fs.readFileSync(__dirname + '/../views/email/activeaccount.hbs', 'utf8');
var activeAccountTemplate = Handlebars.compile(source);

var source = fs.readFileSync(__dirname + '/../views/email/forgotpassword.hbs', 'utf8');
var forgotPasswordTemplate = Handlebars.compile(source);

exports.sendCheckoutEmail = (email, cart, TongTien, PhiVC, Thue, HoaDon) => {
    const mailOptions = {
        from: 'bookstrore@bookstore.com', // sender address
        to: email, // list of receivers
        subject: 'Chi Tiết Đơn Hàng Tại BookStore', // Subject line
        html: CheckoutTemplate({ cart, TongTien, PhiVC, Thue, HoaDon })
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            return console.log(err);
        console.log("Sent Mail");
    })
};

exports.sendActiveAccountEmail = (email, token) => {
    const mailOptions = {
        from: 'bookstrore@bookstore.com', // sender address
        to: email, // list of receivers
        subject: 'Kích Hoạt Tài Khoản tại BookStore', // Subject line
        html: activeAccountTemplate({ token })
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            return console.log(err)
        console.log("Sent Mail");

    })
}


exports.sendResetPasswordEmail = (email, token) => {
    const mailOptions = {
        from: 'bookstrore@bookstore.com', // sender address
        to: email, // list of receivers
        subject: 'Đặt Lại Mật Khẩu Tài Khoản tại BookStore', // Subject line
        html: forgotPasswordTemplate({ token })
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            return console.log(err)
        console.log("Sent Mail");
    })
}
