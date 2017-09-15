'use strict';

angular.module('channelApp').controller('MakeAccount', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
    $scope.params = {
        enddate: ""
    }
    $scope.enddate = new Date()
    $scope.tableData = []
    $scope.search = function() {
        if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
        $http.get('/api/dataanalysis/agentaccountcustomer?' + jQuery.param($scope.params)).success(function(result) {
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
            aConfirmZero  = 0,
            aUnMonition  = 0,
            aUnMakeAccount  = 0,
            aMakeAccountUnConfirm  = 0,
            // aReceiptCompleteUnMakeAccount  = 0,
            aConfirm  = 0,
            aTax  = 0,
            aUnTax  = 0;
        angular.forEach(data, function(item) {
            aCurrentBusinessDateCompanyCount += +item.CurrentBusinessDateCompanyCount;
            aTiDanZero += +item.TiDanZero;
            aConfirmZero += +item.ConfirmZero;
            aUnMonition += +item.UnMonition;
            aUnMakeAccount += +item.UnMakeAccount;
            aMakeAccountUnConfirm += +item.MakeAccountUnConfirm;
            // aReceiptCompleteUnMakeAccount += +item.ReceiptCompleteUnMakeAccount;
            aConfirm += +item.Confirm;
            aTax += +item.Tax;
            aUnTax += +item.UnTax;
        });
        $scope.aCurrentBusinessDateCompanyCount = aCurrentBusinessDateCompanyCount;
        $scope.aTiDanZero = aTiDanZero;
        $scope.aConfirmZero = aConfirmZero;
        $scope.aUnMonition = aUnMonition;
        $scope.aUnMakeAccount = aUnMakeAccount;
        $scope.aMakeAccountUnConfirm = aMakeAccountUnConfirm;
        // $scope.aReceiptCompleteUnMakeAccount = aReceiptCompleteUnMakeAccount;
        $scope.aConfirm = aConfirm;
        $scope.aTax = aTax;
        $scope.aUnTax = aUnTax;
        return data;
    }
    $scope.url = 'https://agent.pilipa.cn/api/v1/AgentExport.ashx'
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
      var url = $scope.url + '?type=getmonitionandunmakeaccount&' + $.param(params);
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
      var url = $scope.url + '?type=getmakeaccountandunconfirm&' + $.param(params);
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
      var url = $scope.url + '?type=getuntax&' + $.param(params);
      window.open(url)
    }
    $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.toExcel = function() {
        $scope.exportHref = Excel.tableToExcel('div[js-height]>#dataTable', 'sheet name');
        $timeout(function() { location.href = $scope.exportHref; }, 100); // trigger download
    }
}]);
