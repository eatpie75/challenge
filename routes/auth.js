var express = require('express');
var router = express.Router();
var passport = require('../middleware/passport');
var models = require('../models');


router.get('/logout', function(req, res) {
  req.logout();
  if (req.xhr) {
    res.json({'success': true});
  } else {
    res.redirect('/');
  }
});

router.get('/login', function(req, res, next) {
  if (process.env.TESTING) {
    req.login({id:1}, function() {
      res.send();
    });
    return;
  }
  next();
}, passport.authenticate('facebook', {'scope': ['email', 'user_friends']}));

router.get('/facebook/callback', passport.authenticate('facebook'), function(req, res) {
  var query = {
    'include': {
      'model': models.User,
      'as': 'participants',
      'where': {
        'id': req.user.id
      }
    }
  };

  models.Challenge.count(query).then(function(count) {
    if (count > 0) {
      res.redirect('/#/user');
    } else {
      res.redirect('/#/challenge/public');
    }
  });
});

module.exports = {
  'router': router
};
