'use strict';
angular.module('channelApp').controller('StatisNewCustomers', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
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
    $http.get('/api/newcustomer?' + jQuery.param($scope.params)).success(function(result) {
        console.log(result, 'result')
        $scope.tableData = result.data.DataInfo
        $scope.rows = formateData($scope.tableData);
    });
  }
  $scope.search();
  $scope.startChange = function() {
    $scope.dateOptions2.minDate = $scope.startdate;
  }
  function formateData(data) {
    var aZeroNum = 0,
        aSmallNum = 0,
        aNormalNum = 0,
        aCustomerNum = 0,
        aContractAmount = 0,
        aZeroAmount = 0;
    angular.forEach(data, function(item) {
        aZeroNum += +item.ZeroNum;
        aSmallNum += +item.SmallNum;
        aNormalNum += +item.NormalNum;
        aCustomerNum += +item.CustomerNum;
        aContractAmount += +item.ContractAmount;
        aZeroAmount += +item.ZeroAmount
    });
    $scope.aZeroNum = aZeroNum;
    $scope.aSmallNum = aSmallNum;
    $scope.aNormalNum = aNormalNum;
    $scope.aCustomerNum = aCustomerNum;
    $scope.aContractAmount = aContractAmount;
    $scope.aZeroAmount = aZeroAmount;
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
    var url = '/api/download/getzeroorders?iscustomers=1' + $.param($scope.postData);
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '新增客户统计');
  }
}]);
