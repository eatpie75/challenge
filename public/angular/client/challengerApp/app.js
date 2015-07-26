angular.module('challengeApp', [
  'challengeApp.challenge',
  'challengeApp.createChallenge',
  'challengeApp.userChallenge',
  'challengeApp.services',
  'ui.router'
])

.config(function($stateProvider, $urlRouterProvider) {
    
  $urlRouterProvider.otherwise('/signin');
    
  $stateProvider
    .state('signin', {
      url: '/signin',
      templateUrl: 'angular/client/challengerApp/auth/signin.html',
    })

    .state('signout', {
      url: '/signout',
      controller: function($scope, $state) {
        $scope.logout();
        $state.go('signin');
      }
    })

    .state('challenge_create', {
      url: '/challenge/create',
      templateUrl: 'angular/client/challengerApp/create/create.html',
      controller: 'CreateChallengeController'
    })
    .state('challenge_view', {
      url: '/challenge/:id',
      templateUrl: 'angular/client/challengerApp/challenge/challenge.html',
      controller: 'ChallengeController'
    })

    .state('user', {
      url: '/user',
      templateUrl: 'angular/client/challengerApp/user/index.html',
      controller: 'UserChallengesController'
    });

}).controller('ChallengeAppController', function($scope, $state, Auth) {
  $scope.user = null;

  $scope.setCurrentUser = function() {
    Auth.getUserInfo().then(function(user) {
      $scope.user = user;
    }, function() {
      $state.go('signin');
    });
  };

  $scope.logout = function() {
    Auth.logout().then(function() {
      $scope.user = null;
    });
  };

  $scope.setCurrentUser();
}).filter('challengeFilter', function() {
  return function(input, accepted, started, complete, user) {
    user = (user !== undefined) ? parseInt(user) : undefined;
    accepted = (accepted !== undefined && user !==undefined) ? !!parseInt(accepted) : null;
    started = (started !== undefined) ? !!parseInt(started) : false;
    complete = (complete !== undefined) ? !!parseInt(complete): false;

    return input.filter(function(challenge) {
      var has_accepted;

      if (accepted !== null) {
        has_accepted = challenge.participants.some(function(participant) {
          return (participant.accepted === accepted && participant.id === user);
        });
      } else {
        has_accepted = true;
      }

      return (challenge.started === started && challenge.complete === complete && has_accepted);
    });
  };
}).directive('challengeTable', function() {
  return {
    'scope': {
      'challenges': '=',
      'user': '@',
      'accepted': '@',
      'started': '@',
      'complete': '@',
      'caption': '@'
    },
    'restrict': 'E',
    'templateUrl': '/angular/client/challengerApp/user/challengeTable.html'
  };
});;
