'use strict';
angular.module('channelApp').controller('StatisOrders', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
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
    $http.get('/api/report/getorderstotalnum?' + jQuery.param($scope.params)).success(function(result) {
        console.log(result, 'result')
        $scope.tableData = result.data
        $scope.rows = formateData($scope.tableData);
    });
  }
  $scope.search();
  $scope.startChange = function() {
    $scope.dateOptions2.minDate = $scope.startdate;
  }
  function formateData(data) {
    var aZeroYearNum = 0,
        aQuarterNum = 0,
        aHalfYearNum = 0,
        aYearNum = 0,
        aReserveNum = 0,
        aFormalNum = 0,
        aNewNum = 0,
        aReNum = 0,
        aZeroNum = 0,
        aSmallNum = 0,
        aNormalNum = 0,
        aTotalNum = 0;
    angular.forEach(data, function(item) {
        aZeroYearNum += +item.ZeroYearNum;
        aQuarterNum += +item.QuarterNum;
        aHalfYearNum += +item.HalfYearNum;
        aYearNum += +item.YearNum;
        aReserveNum += +item.ReserveNum;
        aFormalNum += +item.FormalNum;
        aNewNum += +item.NewNum;
        aReNum += +item.ReNum;
        aZeroNum += +item.ZeroNum;
        aSmallNum += +item.SmallNum;
        aNormalNum += +item.NormalNum;
        aTotalNum += +item.TotalNum;
    });
    $scope.aZeroYearNum = aZeroYearNum;
    $scope.aQuarterNum = aQuarterNum;
    $scope.aHalfYearNum = aHalfYearNum;
    $scope.aYearNum = aYearNum;
    $scope.aReserveNum = aReserveNum;
    $scope.aFormalNum = aFormalNum;
    $scope.aNewNum = aNewNum;
    $scope.aReNum = aReNum;
    $scope.aZeroNum = aZeroNum;
    $scope.aSmallNum = aSmallNum;
    $scope.aNormalNum = aNormalNum;
    $scope.aTotalNum = aTotalNum;
    return data;
  }
  $scope.postData = {}
  var startdate = $filter('date')($scope.startdate, 'yyyy-MM-dd');
  var enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
  $scope.postData.startdate = startdate
  $scope.postData.enddate = enddate
  $scope.downloadColumn1 = function(item) {
    // console.log(item)
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/download/getreserveorders?' + $.param($scope.postData);
    window.open(url)
  }
  $scope.downloadColumn2 = function(item) {
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/download/getzeroorders?' + $.param($scope.postData);
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '订单统计');
  }
}]);
