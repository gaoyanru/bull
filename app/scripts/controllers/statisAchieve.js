'use strict';
angular.module('channelApp').controller('StatisAchieve', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
  $scope.params = {
    startdate: "",
    enddate: "",
  }
  function getNowMonthStartDate () {
    var date = new Date();
    date.setDate(1)
    return date
  }
  function getNowMonthLastDate () {
    var date = new Date();
    date.setMonth(date.getMonth() + 1)
    date.setDate(0)
    return date
  }
  var start = getNowMonthStartDate()
  var end = getNowMonthLastDate()
  $scope.startdate = start
  $scope.enddate = end
  $scope.tableData = []
  $scope.search = function() {
    if ($scope.startdate) $scope.params.startdate = $filter('date')($scope.startdate, 'yyyy-MM-dd');
    if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
    $http.get('/api/agentsreports?' + jQuery.param($scope.params)).success(function(result) {
        // console.log(result, 'result')
        $scope.tableData = result.data
        $scope.rows = formateData($scope.tableData);
    });
  }
  $scope.search();
  $scope.startChange = function() {
    $scope.dateOptions2.minDate = $scope.startdate;
  }
  function formateData(data) {
    var aOrderNumZero = 0,
        aYSSmall = 0,
        aYSGeneral = 0,
        aYSHJ = 0,
        aYSZero = 0,
        aSSSmall = 0,
        aSSGeneral = 0,
        aSSHJ = 0,
        aSSZero = 0,
        aOrderNumSmall = 0,
        aOrderNumGeneral = 0,
        aOrderNumHJ = 0;
    angular.forEach(data, function(item) {
        aOrderNumZero += +item.OrderNumZero;
        aYSSmall += +item.YSSmall;
        aYSGeneral += +item.YSGeneral;
        aYSHJ += +item.YSHJ;
        aYSZero += +item.YSZero;
        aSSSmall += +item.SSSmall;
        aSSGeneral += +item.SSGeneral;
        aSSHJ += +item.SSHJ;
        aSSZero += +item.SSZero;
        aOrderNumSmall += +item.OrderNumSmall;
        aOrderNumGeneral += +item.OrderNumGeneral;
        aOrderNumHJ += +item.OrderNumHJ;
    });
    $scope.aOrderNumZero = aOrderNumZero;
    $scope.aYSSmall = aYSSmall;
    $scope.aYSGeneral = aYSGeneral;
    $scope.aYSHJ = aYSHJ;
    $scope.aYSZero = aYSZero;
    $scope.aSSSmall = aSSSmall;
    $scope.aSSGeneral = aSSGeneral;
    $scope.aSSHJ = aSSHJ;
    $scope.aSSZero = aSSZero;
    $scope.aOrderNumSmall = aOrderNumSmall;
    $scope.aOrderNumGeneral = aOrderNumGeneral;
    $scope.aOrderNumHJ = aOrderNumHJ;
    return data;
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '业绩统计');
  }
}]);
