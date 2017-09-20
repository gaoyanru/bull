'use strict';
angular.module('channelApp').controller('StatisCompanyType', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
  $scope.params = {
    startdate: "",
    enddate: "",
  }
  $scope.tableData = []
  $scope.search = function() {
    if ($scope.startdate) $scope.params.startdate = $filter('date')($scope.startdate, 'yyyy-MM-dd');
    if ($scope.enddate) $scope.params.enddate = $filter('date')($scope.enddate, 'yyyy-MM-dd');
    $http.get('/api/dataanalysis/littletoformal?' + jQuery.param($scope.params)).success(function(result) {
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
    var alittlenum = 0,
        aformalnum = 0;
    angular.forEach(data, function(item) {
        alittlenum += +item.littlenum;
        aformalnum += +item.formalnum;
    });
    $scope.alittlenum = alittlenum;
    $scope.aformalnum = aformalnum;
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
    var url = '/api/dataanalysis/exportlittlelist?' + $.param($scope.postData);
    window.open(url)
  }
  $scope.downloadColumn2 = function(item) {
    var channelid = item.ChannelId
    $scope.postData.channelid = channelid
    var url = '/api/dataanalysis/exportlittletoformallist?' + $.param($scope.postData);
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '小规模转为一般纳税人统计');
  }
}]);
