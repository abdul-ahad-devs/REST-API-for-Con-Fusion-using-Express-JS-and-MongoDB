var passport = require('passport');
var LocalStratrgy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStratrgy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());