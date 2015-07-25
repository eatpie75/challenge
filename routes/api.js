var express = require('express');
var router = express.Router();
var models = require('../models');

/**
 * Check if user is logged in and return an error otherwise
 */
var requires_login = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({'error': 'ENOTAUTH', 'message':'Endpoint requires login.'});
  } else {
    next();
  }
};


/**
 * Endpoint to get information about logged in user
 *
 * Requires login
 */
router.get('/user_info', requires_login, function(req, res) {
  var data = {
    'id': req.user.id,
    'first_name': req.user.first_name,
    'last_name': req.user.last_name,
    'email' : req.user.email,
    'profile_image': '/img/placeholder.jpg'
  };

  res.json(data);
});

router.get('/user_search', requires_login, function(req, res) {
  models.User.findAll().then(function(users) {
    var data = [];
    users.forEach(function(user) {
      data.push({
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email' : user.email,
        'profile_image': '/img/placeholder.jpg'
      });
    });
    
    res.json(data);
  });
});


var prepare_challenge_data = function(challenge) {
  var data = {
    'id': challenge.id,
    'title': challenge.title,
    'message': challenge.message,
    'wager': challenge.wager || '',
    'url': challenge.url_id,
    'creator': challenge.creator,
    'started': challenge.started,
    'complete': challenge.complete,
    'winner': challenge.winner,
    'date_created': challenge.createdAt,
    'date_started': challenge.date_started,
    'date_completed': challenge.date_completed,
    'participants': []
  };

  if (!challenge.participants) return data;

  challenge.participants.forEach(function(participant) {
    data.participants.push({
      'id': participant.id,
      'first_name': participant.first_name,
      'last_name': participant.last_name,
      'accepted': participant.usersChallenges.accepted,
      'profile_image': '/img/placeholder.jpg'
    });
  });

  return data;
};

/**
 * Endpoint to get a list of challenges associated with currently logged in user
 *
 * Requires login
 */
router.get('/challenge/user', requires_login, function(req, res) {
  var query = {
    'limit': 50,
  };

  models.Challenge.findAll(query).then(function(challenges) {
    var data = [];
    var challenge_id_list = challenges.map(function(challenge) {return challenge.id;});

    models.UserChallenge.findAll({
      'where': {
        'challengeId': {
          '$in': challenge_id_list
        }
      },
      'include': {
        'model': models.User
      }
    }).then(function(users) {
      var participants = {};
      challenge_id_list.forEach(function(id) {
        if (participants[id] === undefined) participants[id] = [];
        users.forEach(function(user) {
          if (user.challengeId === id) {
            participants[id].push(user);
          }
        });
      });
      challenges.forEach(function(challenge) {
        var tmp = prepare_challenge_data(challenge);

        participants[challenge.id].forEach(function(participant) {
          tmp.participants.push({
            'id': participant.user.id,
            'first_name': participant.user.first_name,
            'last_name': participant.user.last_name,
            'accepted': participant.accepted,
            'profile_image': '/img/placeholder.jpg'
          });
        });

        data.push(tmp);
      });

      res.json(data);
    });
  });
});


/**
 * Endpoint to get a list of public challenges
 */
router.get('/challenge/public', function(req, res) {
  var query = {
    'limit': 10,
    'include': {
      'model': models.User,
      'as': 'participants'
    }
  };

  models.Challenge.findAll(query).then(function(challenges) {
    var data = [];

    challenges.forEach(function(challenge) {
      data.push(prepare_challenge_data(challenge));
    });

    res.json(data);
  });
});


/**
 * Endpoint to get single challenge specified by id
 */
router.get('/challenge/:id', function(req, res) {
  var target_id = parseInt(req.params.id);
  
  var query = {
    'include': {
      'model': models.User,
      'as': 'participants'
    }
  };

  models.Challenge.findById(target_id, query).then(function(challenge) {
    res.json(prepare_challenge_data(challenge));
  });
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
  var participants = (req.body.participants !== undefined) ? req.body.participants : [];
  var challenge_id;

  if (!challenge_form_is_valid(form)) {
    res.status(400).json({'error': 'EINVALID', 'message': 'Submitted form is invalid.'});
    return;
  }

  models.Challenge.create({
    'title': form.title,
    'message': form.message,
    'wager': (form.wager !== undefined) ? form.wager : '',
    'creator': req.user.id
  }).then(function(instance) {
    challenge_id = instance.id;
    return instance.addParticipant(req.user.id, {'accepted':true}).then(function() {
      return instance.addParticipants(participants);
    });
  }, function(error) {
    res.status(500).json({'error': 'EUNKNOWN', 'message': 'Challenge could not be created'});
  }).then(function() {
    var query = {
      'include': {
        'model': models.User,
        'as': 'participants'
      }
    };

    return models.Challenge.findById(challenge_id, query);
  }).then(function(challenge) {
    var data = prepare_challenge_data(challenge);

    res.status(201).json(data);
  });
});


/**
 * Endpoint to set a challenge to started
 *
 * Requires login
 */
router.put('/challenge/:id/started', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);

  var query = {
    'where': {
      'id': target_id,
      'creator': req.user.id,
      'started': false
    }
  };

  models.Challenge.find(query).then(function(challenge) {
    if (challenge === null) {
      res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
      return;
    }
    challenge.started = true;
    challenge.date_started = Date.now();
    challenge.save().then(function() {
      res.json({'success':true});
    });
  });
});


/**
 * Endpoint to set a winner and complete challenge
 *
 * Requires login
 */
router.put('/challenge/:id/complete', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  var winner = parseInt(req.body.winner);
  winner = (!Number.isNaN(winner)) ? winner : null;

  var query = {
    'where': {
      'id': target_id,
      'creator': req.user.id,
      'started': true,
      'complete': false
    }
  };

  models.Challenge.find(query).then(function(challenge) {
    if (challenge === null) {
      res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
      return;
    }
    challenge.complete = true;
    challenge.winner = winner;
    challenge.date_completed = Date.now();
    challenge.save().then(function() {
      res.json({'success':true});
    });
  });
});


router.put('/challenge/:id/accept', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  
  var query = {
    'where': {
      'challengeId': target_id,
      'userId': req.user.id,
      'accepted': false
    }
  };

  models.UserChallenge.find(query).then(function(user_challenge) {
    if (user_challenge === null) {
      res.status(400).json({'error': 'ENOTFOUND', 'message': 'Could not find appropriate challenge with the id: ' + target_id});
      return;
    }
    user_challenge.accepted = true;
    user_challenge.save().then(function() {
      res.json({'success': true});
    });
  });
});


module.exports = {
  'router': router,
  'challenge_form_is_valid': challenge_form_is_valid
};
