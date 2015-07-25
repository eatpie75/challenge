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
});
