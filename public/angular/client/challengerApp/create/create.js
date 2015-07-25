angular.module('challengeApp.createChallenge', [])

.controller('CreateChallengeController', function ($scope, $state, CreateChallengeFactory) {
  
  $scope.allUsers = [];
  $scope.challengeInfo = {};
  $scope.challengeInfo.participants = [];

  // get array of all users in the database
  CreateChallengeFactory.getAllUsers().then(function(res){
    angular.forEach(res, function(user){
      user.full_name = user.first_name+' '+user.last_name;
    });
    $scope.allUsers = res;
  });

  // method that takes the challengeInfo object as argument and calls the factory POST call
  $scope.postChallenge = function(challengeInfo){
    challengeInfo.participants.push( $scope.challengeInfo.challengee.id );
    CreateChallengeFactory.postChallenge($scope.challengeInfo).then(function(res){
      $state.go('challenge_view', {'id': res.id});
    });
  };


});
