const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const db = require('./config/mongodb.config').MongoDBURL;
const flash = require('connect-flash');
const expressSession = require('express-session');
const passport = require('passport');


const app = express();

const PORT = process.env.PORT || 5000;

// Passport Config
require('./config/passport.config')(passport);

// Mongo Connection
mongoose.connect(db, { useNewUrlParser: true})
.then(() => console.log('MongoDB Connection successful'))
.catch(err => console.log(err));

// Body Parser Middleware
app.use(express.urlencoded({ extended: false}));

// EJS Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express Session
app.use(expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash Messages for express-session
app.use(flash()); // req will now have access to flash function thus passed.

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});