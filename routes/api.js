var express = require('express');
var router = express.Router();


/**
 * Check if user is logged in and return an error otherwise
 */
var requires_login = function(req, res, next) {
  // if (!req.isAuthenticated()) {
  //     res.status(401).json({'error': 'ENOTAUTH', 'message':'Endpoint requires login.'});
  //   } else {
  //     next();
  //   }
  
  // Disabled for now
  next();
};


/**
 * Endpoint to get information about logged in user
 *
 * Requires login
 */
router.get('/user_info', requires_login, function(req, res) {
  // var data = {
  //   'first_name': req.user.first_name,
  //   'last_name': req.user.last_name,
  //   'profile_image' : req.user.profile_image,
  // };

  // Mock data
  var data = {
    // 'id': 1,
    'first_name': 'Randy',
    'last_name': 'Savage',
    'profile_image' : 'http://img.bleacherreport.net/img/images/photos/001/866/715/randy_savage_crop_north.png?w=377&h=251&q=75',
  };

  res.json(data);
});


/**
 * Endpoint to get a list of challenges associated with currently logged in user
 *
 * Requires login
 */
router.get('/challenge/user', requires_login, function(req, res) {
  // var data = req.db.Challenge.findByUser(req.user.id);

  var data = require('../specs/server/mock_challenge_list.json');

  res.json(data);
});


/**
 * Endpoint to get a list of public challenges
 */
router.get('/challenge/public', function(req, res) {
  // var query = {
  //   'limit': 10
  // };
  // 
  // var data = req.db.Challenge.findAll(query);

  var data = require('../specs/server/mock_challenge_list.json');

  res.json(data);
});


/**
 * Endpoint to get single challenge specified by id
 */
router.get('/challenge/:id', function(req, res) {
  var target_id = parseInt(req.params.id);
  // var data = req.db.Challenge.findById(req.params.id);

  var data;
  require('../specs/server/mock_challenge_list.json').forEach(function(challenge) {
    if(challenge.id === target_id) {
      data = challenge;
      return;
    }
  });
  if (data === undefined) {
    res.status(400);
    data = {'error': 'ENOTFOUND', 'message': 'Could not find challenge with the id: ' + target_id};
  }

  res.json(data);
});


/**
 * Check if the submitted form has all required fields
 */
var challenge_form_is_valid = function(form) {
  var valid = true;
  var required_fields = ['title', 'message'];
  var min_text_length = 3;

  required_fields.forEach(function(field) {
    if (form[field] === '' || form[field].length < min_text_length) {
      valid = false;
    }
  });

  return valid;
};


/**
 * Endpoint to post a new challenge
 *
 * Requires login
 */
router.post('/challenge', requires_login, function(req, res) {
  var form = req.body;

  if (!challenge_form_is_valid(form)) {
    res.status(400).json({'error': 'EINVALID', 'message': 'Submitted form is invalid.'});
    return;
  }

  // req.db.Challenge.create({
  //   'title': form.title,
  //   'message': form.message,
  //   'wager': (form.wager !== undefined) ? form.wager : '',
  //   'creator': req.user.id
  // }).then(function(instance) {
  //   res.status(201).json({
  //     'id': instance.id,
  //     'title': instance.title,
  //     'message': instance.message,
  //     'wager': instance.wager,
  //     'url': instance.get_url()
  //   });
  // }, function(error) {
  //   res.status(500).json({'error': 'EUNKNOWN', 'message': 'Challenge could not be created'});
  // });


  res.status(201).json({
    'id': 4,
    'title': form.title,
    'message': form.message,
    'wager': form.wager || '',
    'url': '/challenge/4'
  });
});


/**
 * Endpoint to set a challenge to started
 *
 * Requires login
 */
router.put('/challenge/:id/started', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);

  // var query = {
  //   'where': {
  //     'id': target_id,
  //     'creator': req.user,
  //     'started': false
  //   }
  // };

  // req.db.Challenge.find(query).then(function(challenge) {
  //   challenge.started = true;
  //   challenge.date_started = Date.now();
  //   challenge.save().then(function() {
  //     res.json({'success':true});
  //   });
  // }, function(error) {
  //   res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
  // });

  var found = require('../specs/server/mock_challenge_list.json').some(function(challenge) {
    return (challenge.id === target_id && !challenge.started);
  });
  if (!found) {
    res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
  } else {
    res.json({'success': true});
  }
});


/**
 * Endpoint to set a winner and complete challenge
 *
 * Requires login
 */
router.put('/challenge/:id/complete', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  var winner = req.body.winner;

  // var query = {
  //   'where': {
  //     'id': target_id,
  //     'creator': req.user.id,
  //     'started': true,
  //     'complete': false
  //   }
  // };

  // req.db.Challenge.find(query).then(function(challenge) {
  //   challenge.complete = true;
  //   challenge.winner = winner;
  //   challenge.date_completed = Date.now();
  //   challenge.save().then(function() {
  //     res.json({'success':true});
  //   });
  // }, function(error) {
  //   res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
  // });

  var found = require('../specs/server/mock_challenge_list.json').some(function(challenge) {
    return (challenge.id === target_id && challenge.started && !challenge.complete);
  });
  if (!found) {
    res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
  } else {
    res.json({'success': true});
  }
});


router.put('/challenge/:id/accept', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);

  // var user_id = req.user.id;
  //
  // var query = {
  //   'where': {
  //     'ChallengeId': target_id,
  //     'UserId': req.user.id,
  //     'accepted': false
  //   }
  // };

  // req.db.UserChallenge.find(query).then(function(user_challenge) {
  //   user_challenge.accepted = true;
  //   user_challenge.save().then(function() {
  //     res.json({'success': true});
  //   });
  // }, function(error) {
  //   res.status(400).json({'error': 'ENOTFOUND', 'message': 'User not part of challenge or already accepted'});
  // });


  var user_id = 1;
  var data;
  require('../specs/server/mock_challenge_list.json').forEach(function(challenge) {
    if(challenge.id === target_id && !challenge.started) {
      data = challenge;
      return;
    }
  });
  if (data === undefined) {
    res.status(400).json({'error': 'ENOTFOUND', 'message': 'User not part of challenge or already accepted'});
  } else {
    var found = false;
    data.participants.forEach(function(user) {
      if (user.id === user_id && !user.accepted) {
        found = true;
        return;
      }
    });

    if (!found) {
      res.status(400).json({'error': 'ENOTFOUND', 'message': 'User not part of challenge or already accepted'});
    } else {
      res.json({'success': true});
    }
  }
});


module.exports = {
  'router': router,
  'challenge_form_is_valid': challenge_form_is_valid
};
