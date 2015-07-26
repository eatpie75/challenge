angular.module('challengeApp.userChallenge', [])

.controller('UserChallengesController', function ($scope, ChallengeFactory) {
  $scope.challenges = [];

  $scope.getUserChallenges = function() {
    ChallengeFactory.getUserChallenges().then(function(challenges) {
      $scope.challenges = challenges;
    });
  };
  $scope.getUserChallenges();
});
