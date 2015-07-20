var models = require('../models');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID) {
  var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
} else {
  var facebook_config = require('../facebook_config');
  var FACEBOOK_APP_ID = facebook_config.FACEBOOK_APP_ID;
  var FACEBOOK_APP_SECRET = facebook_config.FACEBOOK_APP_SECRET;
}

var FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback';

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  models.User.findById(id).then(function(user) {
    done(null, {
      'id': user.id,
      'first_name': user.first_name,
      'last_name': user.last_name,
      'email': user.email,
      'profile_image': ''
    });
  }, function(error) {
    done(error);
  });
});

passport.use(new FacebookStrategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'name', 'emails'],
  },
  function(accessToken, refreshToken, profile, done) {
    var query = {
      'where': {
        'fb_id': profile.id
      },
      'defaults': {
        'fb_id': profile.id,
        'first_name': profile.name.givenName,
        'last_name': profile.name.familyName,
        'email': (profile.emails.length) ? profile.emails[0].value : null
      }
    };

    models.User.findOrCreate(query).spread(function(user, created) {
      done(null, user);
    });
  }
));

module.exports = passport;
