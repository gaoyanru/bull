'use strict';
angular.module('channelApp').controller('AddOrderCtrl2', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', function ($scope, $http, $filter, $state, $stateParams, FileUploader, user) {
  $scope.amount = "8047.00"
  $scope.xxx = function(){
    alert('xxx');
  }
  $scope.imgSrc1 = '';
}]);
