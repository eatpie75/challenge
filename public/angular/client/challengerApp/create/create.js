angular.module('challengeApp.createChallenge', [])

.controller('CreateChallengeController', function ($scope, $state, CreateChallengeFactory) {
  
  $scope.allUsers = [];
  $scope.challengeInfo = {};
  $scope.challengeInfo.participants = [];
  $scope.selectedParticipant = null;

  // get array of all users in the database
  CreateChallengeFactory.getAllUsers().then(function(res){
    angular.forEach(res, function(user){
      user.full_name = user.first_name+' '+user.last_name;
    });
    $scope.allUsers = res;
  });

  $scope.addParticipant = function() {
    if ($scope.challengeInfo.participants.indexOf($scope.selectedParticipant.id) === -1) {
      $scope.challengeInfo.participants.push($scope.selectedParticipant.id);
    }
  };

  // method that takes the challengeInfo object as argument and calls the factory POST call
  $scope.postChallenge = function(){
    CreateChallengeFactory.postChallenge($scope.challengeInfo).then(function(res){
      $state.go('challenge_view', {'id': res.id});
    });
  };


});
