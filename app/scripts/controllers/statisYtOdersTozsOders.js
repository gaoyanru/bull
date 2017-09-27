'use strict';
angular.module('channelApp').controller('StatisYtOdersTozsOders', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
  $scope.params = {
    startdate: "",
    enddate: "",
    status: ""
  }
  $scope.postData = {}
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
    $scope.postData = $scope.params
    $http.get('/api/dataanalysis/beforetoformalsearch?' + jQuery.param($scope.params)).success(function(result) {
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
    var aytdcount = 0,
        azzscount = 0;
    angular.forEach(data, function(item) {
        aytdcount += +item.ytdcount;
        azzscount += +item.zzscount;
    });
    $scope.aytdcount = aytdcount;
    $scope.azzscount = azzscount;
    return data;
  }
  $scope.downloadColumn1 = function(item) {
    // console.log(item)
    if (item) {
      var post = {}
      post = angular.copy($scope.postData)
      var channelid = item.ChannelId
      post.channelid = channelid
      var url = '/api/dataanalysis/exportbeforehandlist?' + $.param(post);
    } else {
      var posttotal = {}
      posttotal = angular.copy($scope.postData)
      var url = '/api/dataanalysis/exportbeforehandlist?' + $.param(posttotal);
    }
    window.open(url)
  }
  $scope.downloadColumn2 = function(item) {
    if (item) {
      var post = {}
      post = angular.copy($scope.postData)
      var channelid = item.ChannelId
      post.channelid = channelid
      var url = '/api/dataanalysis/exporttoformallist?' + $.param(post);
    } else {
      var posttotal = {}
      posttotal = angular.copy($scope.postData)
      var url = '/api/dataanalysis/exporttoformallist?' + $.param(posttotal);
    }
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '预提单转正式订单统计');
  }
}]);
