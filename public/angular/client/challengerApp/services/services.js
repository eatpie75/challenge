angular.module('challengeApp.services', [])

.factory('Auth', function ($http) {
  var getUserInfo = function() {
    return $http.get('/api/1/user_info').then(function(res) {
      return res.data;
    }, function(error) {
      throw Error(error);
    });
  };

  var logout = function() {
    return $http.get('/auth/logout').then(function() {
      return true;
    }, function(error) {
      throw Error(error);
    });
  };

  return {
    'getUserInfo': getUserInfo,
    'logout': logout
  };
})

.factory('ChallengeFactory', function($http){
  var getChallengeInfo = function(challengeId){
    return $http({
      method: 'GET',
      url: '/api/1/challenge/' +  challengeId,
    }).then(function(resp){
      return resp.data;
    });
  };

  var acceptChallenge = function(challengeId) {
    return $http({
      method: 'PUT',
      url: '/api/1/challenge/' + challengeId + '/accept',
    }).then(function(resp){
      return resp.data;
    });
  };

  var challengeStart = function(challengeId) {
    return $http({
      method: 'PUT',
      url: '/api/1/challenge/' + challengeId + '/started',
    }).then(function(resp) {
      return resp.data;
    });
  };

  var challengeComplete = function(challengeId, winnerId) {
    console.log(winnerId);
    return $http({
      method: 'PUT',
      url: '/api/1/challenge/' + challengeId + '/complete',
      data: (winnerId !== undefined) ? {'winner': parseInt(winnerId)} : {}
    }).then(function(resp) {
      return resp.data;
    });
  };

  var getUserChallenges = function() {
    return $http({
      method: 'GET',
      url: '/api/1/challenge/user'
    }).then(function(resp) {
      return resp.data;
    });
  };


  return {
    getChallengeInfo: getChallengeInfo,
    acceptChallenge: acceptChallenge,
    challengeStart: challengeStart,
    challengeComplete: challengeComplete,
    getUserChallenges: getUserChallenges
  };
})

.factory('CreateChallengeFactory', function($http){
  var getAllUsers = function(){
    return $http({
      method: 'GET',
      url: '/api/1/user_search',
    }).then(function(resp){
      return resp.data;
    });
  };

  var getCreatorInfo = function(){
    return $http({
      method: 'GET',
      url: '/api/1/user_info',
    }).then(function(resp){
      return resp.data;
    });
  };

  // POST method for creating a challenge
  var postChallenge = function(challengeInfo){
    return $http({
      method: 'POST',
      url: '/api/1/challenge',
      data: challengeInfo
    }).then(function(resp){
      return resp.data;
    });
  };

  return {
    getAllUsers: getAllUsers,
    getCreatorInfo: getCreatorInfo,
    postChallenge: postChallenge
  };
});


