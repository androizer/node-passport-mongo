const express = require('express');
const router = express.Router();
const User = require('../models/user.schema');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
});

// Register Route
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    // Check is all fields are filled in.
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    // Check if password and password2 matches.
    if (password !== password2) {
        errors.push({ msg: 'Password do not match! Retry again'});
    }


    // Password length validation
    if (password.length < 6) {
        errors.push({ msg: 'Password must not be less than 6 characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation passed
        User.findOne({email: email})
        // If users exists
        .then(user => {
            if (user) {
                errors.push({ msg: 'User already exists'});
                res.render('register', {
                    error,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Hash the password
                bcrypt.genSalt(10, (err, salt) => {
                    if (!err) {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (!err) {
                                // Set hash to password
                                newUser.password = hash;

                                newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now Registered and can login');
                                    res.redirect('login');
                                })
                                .catch(err => console.log(err));
                            }
                        });
                    }
                });
            }
        })
        .catch(err => console.log(err));
    }
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'Successfully logged out.');
    res.redirect('/users/login');
});

module.exports = router;