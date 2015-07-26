angular.module('challengeApp.challenge', [])

.controller('ChallengeController', function ($scope, ChallengeFactory, $stateParams) {
  
  $scope.challengeData = {};
  $scope.creator=null;
  $scope.started=false;
  $scope.complete=false;
  $scope.winner=null;

  $scope.canBeStarted = false;
  $scope.isParticipant = false;
  $scope.hasAccepted = false;
  
  $scope.getChallengeInfo = function(id){
    ChallengeFactory.getChallengeInfo(id).then(function(res){
      $scope.challengeData = res;

      $scope.creator = res.participants.filter(function(participant) {return participant.id === res.creator;})[0];
      $scope.winner = res.participants.filter(function(participant) {return participant.id === res.winner;})[0] || null;

      $scope.started = res.started;
      $scope.complete = res.complete;
      $scope.canBeStarted = res.participants.reduce(function(num, participant) {
          return (participant.accepted) ? num++ : num;
      }, 0) > 1;

      if ($scope.user !== null) {
        $scope.isParticipant = res.participants.some(function(participant) {return participant.id === $scope.user.id;});
        $scope.hasAccepted = res.participants.some(function(participant) {return participant.id === $scope.user.id && participant.accepted;});
      }
    });
  };
  $scope.getChallengeInfo($stateParams.id);

  $scope.challengeAccept = function() {
    ChallengeFactory.acceptChallenge($scope.challengeData.id).then(function() {
      $scope.getChallengeInfo($stateParams.id);
    });
  };

  $scope.challengeStart = function() {
    ChallengeFactory.challengeStart($scope.challengeData.id).then(function() {
      $scope.getChallengeInfo($stateParams.id);
    });
  };

  $scope.challengeComplete = function(winnerId) {
    ChallengeFactory.challengeComplete($scope.challengeData.id, winnerId).then(function() {
      $scope.getChallengeInfo($stateParams.id);
    });
  };
}).controller('ChallengeListController', function ($scope, ChallengeFactory) {
  $scope.challenges = [];

  $scope.getChallengeList = function() {
    ChallengeFactory.getChallengeList().then(function(challenges) {
      $scope.challenges = challenges;
    });
  };
  $scope.getChallengeList();
});

