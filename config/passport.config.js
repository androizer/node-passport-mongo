const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/user.schema');

module.exports = function(passport) {
    // Before asking Passport to authenticate a request, the strategy (or strategies) used by an application must be configured.
    // Strategies, and their configuration, are supplied via the use() function.
    passport.use(
        // By default, LocalStrategy expects to find credentials in parameters named username and password. 
        // If your site prefers to name these fields differently, options are available to change the defaults.
        new LocalStrategy(
            { usernameField: 'email'},
            // When Passport authenticates a request, it parses the credentials contained in the request. It then invokes the 
            // verify callback with those credentials as arguments, in this case username and password. If the credentials are 
            // valid, the verify callback invokes done to supply Passport with the user that authenticated.
            (email, password, done) => {

                // Match users
                User.findOne({ email: email})
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'This email doesn\'t exists'});
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (!isMatch) {
                            return done(null, false, { message: 'Incorrect username and password'});
                        } else {
                            return done(null, user);
                        }
                    })
                })
                .catch(err => console.log(err));
            }
        )
    );
    
    // In a typical web application, the credentials used to authenticate a user will only be transmitted during the login 
    // request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.

    // Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. 
    // In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
    
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};