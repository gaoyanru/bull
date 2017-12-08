'use strict';

angular.module('channelApp').controller('WaitSetAccount', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
    $scope.params = {
        enddate: ""
    }
    $scope.enddate = new Date()
    $scope.tableData = []
    $scope.search = function() {
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/dataanalysis/agentrecallcustomer?' + jQuery.param($scope.params)).success(function(result) {
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
        var aTotalNum  = 0,
            aUnMakeAccount = 0,
            aUnMakeAccountRate = 0,
            aUnMakeAccountLess10Day  = 0,
            aUnMakeAccountMore10Day  = 0,
            aUnBusinessDate = 0;
        angular.forEach(data, function(item) {
            aTotalNum += +item.TotalNum;
            aUnMakeAccount += +item.UnMakeAccount;
            aUnMakeAccountRate += +item.UnMakeAccountRate;
            aUnMakeAccountLess10Day += +item.UnMakeAccountLess10Day;
            aUnMakeAccountMore10Day += +item.UnMakeAccountMore10Day;
            aUnBusinessDate += +item.UnBusinessDate;
        });
        $scope.aTotalNum = aTotalNum;
        $scope.aUnMakeAccount = aUnMakeAccount;
        $scope.aUnMakeAccountRate = aUnMakeAccountRate;
        $scope.aUnMakeAccountLess10Day = aUnMakeAccountLess10Day;
        $scope.aUnMakeAccountMore10Day = aUnMakeAccountMore10Day;
        $scope.aUnBusinessDate = aUnBusinessDate;
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
      var url = $scope.url + '?type=getunaccount&' + $.param(params);
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
      var url = $scope.url + '?type=getunaccountmore10day&' + $.param(params);
      window.open(url)
    }
    $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.toExcel = function() {
        Excel.tableToExcel('div[js-height]>#dataTable', '待建账数据统计');
    }
}]);
