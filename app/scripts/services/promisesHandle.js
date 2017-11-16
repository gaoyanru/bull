'use strict';

angular.module('channelApp').factory('promisesHandle', ['$http', function($http){
  return function(promises, cb){
    $.when(promises).done(function(res){
      console.log(res);
      cb && cb(res)
    })
  }
}])
