'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('AchieveCtrl', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
    $scope.isCenter = user.get().IsCenter;
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
        enddate: "",
        cityCode: "",
        provinceCode: "",
        getSelectedText: getSelectedText,
        selectedAll: selectedAll,
        setSelectedText: setSelectedText,
        selectedText: '全部'
    }

    function getSelectedText() {
        if ((!$scope.cities)) return '全部';
        var cities = $scope.cities;
        var selected = _.filter(cities, { selected: true });
        if (selected.length < 3) {
            return _.map(selected, 'Name').join(',');
        }
        if (selected.length === cities.length) {
            return '全部';
        }
        return _.map(_.slice(selected, 0, 2), 'Name').join(',') + '等';
    }

    function setSelectedText(open) {
        $scope.params.selectedText = getSelectedText();
    }

    function selectedAll(flag) {
        if(flag === undefined) return;
        _.each($scope.cities, function(item) {
            item.selected = flag;
        });
    }


    $scope.search = function() {
        if ($scope.startdate) $scope.params.startdate = $filter('date')($scope.startdate, 'yyyy-MM-dd');
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/agentsreports?offset=0&limit=10&' + jQuery.param($scope.params)).success(function(result) {
            var selected = _.filter($scope.cities, { selected: true });
            var resultData;
            if ((!$scope.cities) || selected.length === $scope.cities.length) {
                resultData = result.data;
            } else {
                resultData = _.filter(result.data,function(item){
                    var temp = _.find($scope.cities,{Code:item.CityCode});
                    return temp && temp.selected;
                });
            }

            $scope.rows = formateData(resultData);
        });
    }
    $scope.search();
    $scope.startChange = function() {
        $scope.dateOptions2.minDate = $scope.startdate;
    }

    function formateData(data) {
        var aYSSmall = 0,
            aYSGeneral = 0,
            aYSHJ = 0,
            aSSSmall = 0,
            aSSGeneral = 0,
            aSSHJ = 0,
            aOrderNumSmall = 0,
            aOrderNumGeneral = 0,
            aOrderNumHJ = 0;
        angular.forEach(data, function(item) {
            item.cols = [];
            item.cols.push(item.ProvinceName);
            item.cols.push(item.CityName);
            item.cols.push(item.ChannelName1);
            item.cols.push(item.ChannelName2);
            item.cols.push(item.YSSmall);
            item.cols.push(item.YSGeneral);
            item.cols.push(item.YSHJ);
            item.cols.push(item.SSSmall);
            item.cols.push(item.SSGeneral);
            item.cols.push(item.SSHJ);
            item.cols.push(item.OrderNumSmall);
            item.cols.push(item.OrderNumGeneral);
            item.cols.push(item.OrderNumHJ);
            aYSSmall += +item.YSSmall;
            aYSGeneral += +item.YSGeneral;
            aYSHJ += +item.YSHJ;
            aSSSmall += +item.SSSmall;
            aSSGeneral += +item.SSGeneral;
            aSSHJ += +item.SSHJ;
            aOrderNumSmall += +item.OrderNumSmall;
            aOrderNumGeneral += +item.OrderNumGeneral;
            aOrderNumHJ += +item.OrderNumHJ;
        });
        $scope.aYSSmall = aYSSmall;
        $scope.aYSGeneral = aYSGeneral;
        $scope.aYSHJ = aYSHJ;
        $scope.aSSSmall = aSSSmall;
        $scope.aSSGeneral = aSSGeneral;
        $scope.aSSHJ = aSSHJ;
        $scope.aOrderNumSmall = aOrderNumSmall;
        $scope.aOrderNumGeneral = aOrderNumGeneral;
        $scope.aOrderNumHJ = aOrderNumHJ;
        return data;
    }
    $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.toExcel = function() {
        $scope.exportHref = Excel.tableToExcel('div[js-height]>#dataTable', 'sheet name');
        $timeout(function() { location.href = $scope.exportHref; }, 100); // trigger download
    }
}]);
