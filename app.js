var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var session = require('express-session');
require('./handlebars/helpers')(hbs);
require('./handlebars/partials')(hbs);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const theLoai = require('./middleware/theloai');

var indexRouter = require('./routes/index');
var adminsRouter = require('./routes/admins');
var usersRouter = require('./routes/users');
var authorsRouter = require('./routes/authors');
var booksRouter = require('./routes/books');
var genresRouter = require('./routes/genres');
var authenRouter = require('./routes/authen');
var ratingRouter = require('./routes/rating');
var cartRouter = require('./routes/shoppingcart');
var checkoutRouter = require('./routes/checkout');

var TheLoai = require('./models/TheLoai')
var NguoiDung = require('./models/NguoiDung');
var LichSuTimKiem = require('./models/LichSuTimKiem');

var app = express();

// Connect to MongoDB
//Set up mongoose connection

// node populatedbfromfiles 
var mongoose = require('mongoose');
var mongoDB = '';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// to use app.locals
hbs.localsAsTemplateData(app);
// to use partial views
hbs.registerPartials(__dirname + "/views/partials");


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "SeRectKeY@123",
    saveUninitialized: true,
    resave: true
}))

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    NguoiDung.findById(id)
    .populate({path: 'lsTimKiem', options: { sort: { 'ThoiDiem': -1 } } })
    .then(user=>{
        user.lsTimKiem.slice(0,10);
        done(undefined,user)
    }).catch(err=>{
        done(err,undefined)
    })
});


app.use(passport.initialize());
app.use(passport.session());

//for view user
app.use((req, res, next) => {
    console.log('User: '+req.isAuthenticated())
    app.locals.userAuthen = req.isAuthenticated();
    if (req.isAuthenticated()) {
        app.locals.user = req.user;
        if(req.user.isAdmin()){
            req.isAdmin = true;
        }
    }
    next();
})


app.use((req, res, next) => {
    var cart = req.session.shoppingcart;

    req.session.totalcart = 0;
    app.locals.totalcart = 0;

    if (cart === undefined) {
        app.locals.shoppingcart = [];
    }
    else {
        app.locals.shoppingcart = cart;
        for (var i = 0; i < cart.length; i++) {
            app.locals.totalcart += cart[i].book.Gia * cart[i].soluong;
        }
        req.session.totalcart = app.locals.totalcart;
    }
    next();

})

app.use('/rating', ratingRouter);
app.use('/cart', cartRouter);
app.use('/authen', authenRouter);
app.use('/', indexRouter);
app.use('/admins', adminsRouter);
app.use('/users', usersRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);
app.use('/genres', genresRouter);
app.use('/checkout', checkoutRouter);


app.use('/test', (req, res) => {
    res.render('admin/admin_index')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if (err.status === 404) {
        //theLoai(req,res,next);
        TheLoai.find({}).then((result) => {
            req.app.locals.theLoais = result;
            res.render('error/404', { title: "404 Not Found" });
        }).catch((err) => {
            req.app.locals.theLoais = [];
            res.render('error/404', { title: "404 Not Found" });
        })
    } else {
        res.status(err.status || 500);
        res.render('error/error');
        //res.send("error");
    }

});


module.exports = app;



passport.use(new LocalStrategy({
    usernameField: 'Email',
    passwordField: 'MatKhau',
    passReqToCallback: true,
    session: false
  },
  function(username, password, done) {
    NguoiDung.findOne({ Email: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.validPassword(password)) { return done(null, false); }
        return done(null, user);
      });
  }
));