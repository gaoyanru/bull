'use strict';

angular.module('channelApp').controller('NewCustomer', ['$scope', '$http', '$filter', 'user', function($scope, $http, $filter, user) {
    $scope.isCenter = user.get().IsCenter;
    var startime = new Date();
    startime.setMonth(startime.getMonth()-1);
    $scope.startdate = startime;
    $scope.enddate = new Date();
    if ($scope.isCenter) {
        $http.get("/api/code/city").success(function(data) {
            _.each(data.data, function(item) {
                item.selected = true;
            });
            $scope.cities = data.data;
        });
    }
    $scope.params = {
        startime: "",
        endtime: ""
    }

    $scope.search = function() {
        if ($scope.startdate) $scope.params.startime = $filter('date')($scope.startdate, 'yyyy-MM-dd');
        if ($scope.enddate) $scope.params.endtime = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/newcustomer?' + jQuery.param($scope.params)).success(function(result) {
            $scope.rows = result.data;
            $scope.totalNum = _.reduce(result.data, function(total, n) {
                return total + n.CustomerNum;
            },0);
            $scope.totalAmount = _.reduce(result.data, function(total, n) {
                return total + n.ContractAmount;
            },0);
        });
    }
    $scope.search();
    $scope.startChange = function() {
        $scope.dateOptions2.minDate = $scope.startdate;
    }
}]);
