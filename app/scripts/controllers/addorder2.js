'use strict';
angular.module('channelApp').controller('AddOrderCtrl2', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', function ($scope, $http, $filter, $state, $stateParams, FileUploader, user) {
  $scope.amount = "8047.00"
  $scope.imgSrc1 = '';
  $scope.imgSrc2 = '';

  $scope.startDateOptions = {
      formatYear: 'yyyy'
  };
  $scope.endDateOptions = {
      formatYear: 'yyyy'
  };

  $scope.save = function(){
    console.log($scope)
  }
}]);
