'use strict';

angular.module('channelApp').controller('Receipt', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
    $scope.params = {
        enddate: ""
    }
    $scope.enddate = new Date()
    $scope.tableData = []
    $scope.search = function() {
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/dataanalysis/agentreceiptcustomer?' + jQuery.param($scope.params)).success(function(result) {
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
        var aCurrentBusinessDateCompanyCount = 0,
            aTiDanZero  = 0,
            aUnUrgeCount  = 0,
            aUrgeCount  = 0,
            aConfirmZero  = 0,
            aUnMonitionCount  = 0,
            aMonitionCount  = 0,
            aMonitionCompleteCount  = 0,
            // aCompleteRate  = 0,
            aRejectCount  = 0;
        angular.forEach(data, function(item) {
            aCurrentBusinessDateCompanyCount += +item.CurrentBusinessDateCompanyCount;
            aTiDanZero += +item.TiDanZero;
            aUnUrgeCount += +item.UnUrgeCount;
            aUrgeCount += +item.UrgeCount;
            aConfirmZero += +item.ConfirmZero;
            aUnMonitionCount += +item.UnMonitionCount;
            aMonitionCount += +item.MonitionCount;
            aMonitionCompleteCount += +item.MonitionCompleteCount;
            // aCompleteRate += +item.CompleteRate;
            aRejectCount += +item.RejectCount;
        });
        $scope.aCurrentBusinessDateCompanyCount = aCurrentBusinessDateCompanyCount;
        $scope.aTiDanZero = aTiDanZero;
        $scope.aUnUrgeCount = aUnUrgeCount;
        $scope.aUrgeCount = aUrgeCount;
        $scope.aConfirmZero = aConfirmZero;
        $scope.aUnMonitionCount = aUnMonitionCount;
        $scope.aMonitionCount = aMonitionCount;
        $scope.aMonitionCompleteCount = aMonitionCompleteCount;
        // $scope.aCompleteRate = aCompleteRate;
        $scope.aRejectCount = aRejectCount;
        return data;
    }
    // $scope.url = 'https://agent.pilipa.cn/api/v1/AgentExport.ashx'
    $scope.url = 'http://123.56.31.133:8083/api/v1/AgentExport.ashx'
    $scope.downloadColumn1 = function(item) {
      // console.log(item)
      var AccountId = item.AccountId
      var date = new Date()
      var enddate = date
      enddate = $filter('date')(enddate, 'yyyy-MM-dd');
      // console.log(AccountId, enddate)
      var params = {}
      params.accountid = AccountId
      params.enddate = enddate
      var url = $scope.url + '?type=ReceiptDetail&' + $.param(params);
      window.open(url)
    }
    $scope.downloadColumn2 = function(item) {
      // console.log(item)
      var AccountId = item.AccountId
      var date = new Date()
      var enddate = date
      enddate = $filter('date')(enddate, 'yyyy-MM-dd');
      // console.log(AccountId, enddate)
      var params = {}
      params.accountid = AccountId
      params.enddate = enddate
      var url = $scope.url + '?type=unurge&' + $.param(params);
      window.open(url)
    }
    $scope.downloadColumn3 = function(item) {
      // console.log(item)
      var AccountId = item.AccountId
      var date = new Date()
      var enddate = date
      enddate = $filter('date')(enddate, 'yyyy-MM-dd');
      // console.log(AccountId, enddate)
      var params = {}
      params.accountid = AccountId
      params.enddate = enddate
      var url = $scope.url + '?type=urge&' + $.param(params);
      window.open(url)
    }
    $scope.downloadColumn4 = function(item) {
      // console.log(item)
      var AccountId = item.AccountId
      var date = new Date()
      var enddate = date
      enddate = $filter('date')(enddate, 'yyyy-MM-dd');
      // console.log(AccountId, enddate)
      var params = {}
      params.accountid = AccountId
      params.enddate = enddate
      var url = $scope.url + '?type=requirereceipt&' + $.param(params);
      window.open(url)
    }
    $scope.downloadColumn5 = function(item) {
      // console.log(item)
      var AccountId = item.AccountId
      var date = new Date()
      var enddate = date
      enddate = $filter('date')(enddate, 'yyyy-MM-dd');
      // console.log(AccountId, enddate)
      var params = {}
      params.accountid = AccountId
      params.enddate = enddate
      var url = $scope.url + '?type=rejectreceipt&' + $.param(params);
      window.open(url)
    }
    $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.toExcel = function() {
        Excel.tableToExcel('div[js-height]>#dataTable', '传票数据统计');
    }
}]);
