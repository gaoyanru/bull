'use strict';

angular.module('channelApp').controller('StatisPaytype', ['$scope', '$http', '$filter', 'user', function($scope, $http, $filter, user) {
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
        startdate: "",
        enddate: ""
    }
    $http.get("api/cityprice?cityCode=").success(function(data) {
        $scope.priceNames = _.keys(_.groupBy(data.data,'PriceName'));
    });
    $scope.search = function() {
        if ($scope.startdate) $scope.params.startdate = $filter('date')($scope.startdate, 'yyyy-MM-dd');
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/agentordernum?' + jQuery.param($scope.params)).success(function(result) {
           
            var rows = _.groupBy(result.data,function(item) {
                return item.ChannelId + ',' + item.ChannelId1||'';
            });
            var data = [];
            _.each(rows,function(arr,key) {
                var temp = arr[0];
                _.each($scope.priceNames,function(pn) {
                    var t =  _.find(arr,{PriceName: pn});
                    if(t){
                        temp[pn] = t.OrderNum;
                    }else{
                        temp[pn] = 0;
                    }
                    //temp[pn] = _.find(arr,{PriceName: pn})||0;
                });
                data.push(temp);
            });
            $scope.rows = data;
            
            $scope.total = _.reduce(result.data, function(total, n) {
                if(!n.PriceName) return total;
                if(total[n.PriceName]){
                    total[n.PriceName] += n.OrderNum;
                }else{
                    total[n.PriceName] = n.OrderNum;
                }
                return total;
            },{});
        });
    }
    $scope.search();
    $scope.startChange = function() {
        $scope.dateOptions2.minDate = $scope.startdate;
    }
}]);
