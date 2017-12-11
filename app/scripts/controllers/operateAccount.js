'use strict';

angular.module('channelApp').controller('OperateAccount', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
    $scope.params = {
        enddate: ""
    }
    // console.log(new Date().toGMTString())
    $scope.enddate = new Date()
    // console.log($scope.enddate, '$scope.enddate')
    $scope.tableData = []
    $scope.search = function() {
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/dataanalysis/agenttotalcustomer?' + jQuery.param($scope.params)).success(function(result) {
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
        var aAllCusNum = 0,
            aTotalNum  = 0,
            aTiDanZero  = 0,
            aNoSetUpNum  = 0,
            aRingNum  = 0,
            aLateNum  = 0,
            aUnstartNum  = 0,
            aHungNum  = 0;
        angular.forEach(data, function(item) {
            aAllCusNum += +item.AllCusNum;
            aTotalNum += +item.TotalNum;
            aTiDanZero += +item.TiDanZero;
            aNoSetUpNum += +item.NoSetUpNum;
            aRingNum += +item.RingNum;
            aLateNum += +item.LateNum;
            aUnstartNum += +item.UnstartNum;
            aHungNum += +item.HungNum;
        });
        $scope.aAllCusNum = aAllCusNum;
        $scope.aTotalNum = aTotalNum;
        $scope.aTiDanZero = aTiDanZero;
        $scope.aNoSetUpNum = aNoSetUpNum;
        $scope.aRingNum = aRingNum;
        $scope.aLateNum = aLateNum;
        $scope.aUnstartNum = aUnstartNum;
        $scope.aHungNum = aHungNum;
        return data;
    }
    // $scope.url = 'https://agent.pilipa.cn/api/v1/AgentExport.ashx'
    $scope.url = 'https://ri.i-counting.cn/api/v1/AgentExport.ashx'
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
			var url = $scope.url + '?type=totalcustomer&' + $.param(params);
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
			var url = $scope.url + '?type=historybusinessdate&' + $.param(params);
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
			var url = $scope.url + '?type=totalhung&' + $.param(params);
			window.open(url)
    }
    $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.toExcel = function() {
        Excel.tableToExcel('div[js-height]>#dataTable', '运营会计数据总览');
    }
}]);
