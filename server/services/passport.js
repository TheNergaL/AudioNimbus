const passport = require('passport');
const User = require('../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
require('dotenv').config()

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
	// Verify this email and password, call done with the user
	// if it is the correct email and password
	// Otherwise, call done with false
	User.findOne({ email: email }, function(err, user) {
		if (err) {return done(err); }
		if (!user) { return done(null, false); }

		// Compare passwords - is 'password' equal to user.password?
		user.comparePassword(password, function(err, isMatch) {
			if (err) { return done(err) }
			if (!isMatch) { return done(null, false); }

			return done(null, user);
		});
	});
});

// Setup options for Jwt Strategy
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: process.env.SECRET
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
	// See if the user ID in the payload exists in our database
	// If it does, call 'done' with the user
	// Otherwise, call 'done' without a user object
	User.findById(payload.sub, function(err, user) {
		if (err) { return done(err, false); }

		if (user) {
			done(null, user);
		} else {
			done(null, false);
		}
	});
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
