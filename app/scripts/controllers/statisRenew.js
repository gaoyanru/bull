'use strict';
angular.module('channelApp').controller('StatisRenew', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
  $scope.params = {
		year: '2017',
		months: ''
	}
  var date = new Date()
  $scope.month = (date + '').match(/\d{4}-(\d{1,2})-\d{1,2}/)[1]
  console.log($scope.month, '$scope.month')
  $scope.params.months = $scope.month
  $scope.months = [];
	for (var i = 1; i < 13; i++) {
		$scope.months.push({
			label: i + '月',
			value: i < 10 ? ('0' + i) : i
		})
	}
  $scope.tableData = []
  $scope.search = function() {
    $http.get('/api/report/getreordersnum?' + jQuery.param($scope.params)).success(function(result) {
        // console.log(result, 'result')
        $scope.tableData = result.data
        $scope.rows = formateData($scope.tableData);
    });
  }
  $scope.search();
  function formateData(data) {
    var aExpireNum = 0,
        aNoReNum = 0,
        aReNum = 0;
    angular.forEach(data, function(item) {
        aExpireNum += +item.ExpireNum;
        aNoReNum += +item.NoReNum;
        aReNum += +item.ReNum;
    });
    $scope.aExpireNum = aExpireNum;
    $scope.aNoReNum = aNoReNum;
    $scope.aReNum = aReNum;
    return data;
  }
  $scope.postData = {}
  $scope.postData.year = $scope.params.year
  $scope.postData.months = $scope.params.months
  $scope.downloadColumn1 = function(item) {
    // console.log(item)
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/download/getexpireorderdetails?' + $.param($scope.postData);
    window.open(url)
  }
  $scope.downloadColumn2 = function(item) {
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/download/getnoreorderdetails?' + $.param($scope.postData);
    window.open(url)
  }
  $scope.downloadColumn3 = function(item) {
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/download/getreorderdetails?' + $.param($scope.postData);
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '续费订单统计');
  }
}]);
