'use strict';
angular.module('channelApp').controller('StatisOutworks', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function($scope, $http, $filter, user, Excel, $timeout) {
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
    // console.log($scope.params)
    $scope.postData = $scope.params
    // console.log($scope.postData, '$scope.postData')
    $http.get('/api/dataanalysis/gettasknum?' + jQuery.param($scope.params)).success(function(result) {
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
    var aordernum = 0,
        aallmainnum = 0,
        amainnum1 = 0,
        amainnum2 = 0,
        amainnum3 = 0,
        amainnum4 = 0,
        amainnum5 = 0,
        aallchildnum = 0,
        achildnum1 = 0,
        achildnum2 = 0,
        achildnum3 = 0,
        achildnum4 = 0,
        achildnum5 = 0;
    angular.forEach(data, function(item) {
        aordernum += +item.ordernum;
        aallmainnum += +item.allmainnum;
        amainnum1 += +item.mainnum1;
        amainnum2 += +item.mainnum2;
        amainnum3 += +item.mainnum3;
        amainnum4 += +item.mainnum4;
        amainnum5 += +item.mainnum5;
        aallchildnum += +item.allchildnum;
        achildnum1 += +item.childnum1;
        achildnum2 += +item.childnum2;
        achildnum3 += +item.childnum3;
        achildnum4 += +item.childnum4;
        achildnum5 += +item.childnum5;
    });
    $scope.aordernum = aordernum;
    $scope.aallmainnum = aallmainnum;
    $scope.amainnum1 = amainnum1;
    $scope.amainnum2 = amainnum2;
    $scope.amainnum3 = amainnum3;
    $scope.amainnum4 = amainnum4;
    $scope.amainnum5 = amainnum5;
    $scope.aallchildnum = aallchildnum;
    $scope.achildnum1 = achildnum1;
    $scope.achildnum2 = achildnum2;
    $scope.achildnum3 = achildnum3;
    $scope.achildnum4 = achildnum4;
    $scope.achildnum5 = achildnum5;
    return data;
  }

  $scope.downloadColumn1 = function(item) {
    if (item) {
      var post = {}
      post = angular.copy($scope.postData)
      var channelid = item.ChannelId
      post.channelid = channelid
      var url = '/api/download/getmaintaskdetails?' + $.param(post);
    } else {
      var posttotal = {}
      posttotal = angular.copy($scope.postData)
      var url = '/api/download/getmaintaskdetails?' + $.param(posttotal);
    }
    window.open(url)
  }
  $scope.downloadColumn2 = function(item) {
    if (item) {
      var post = {}
      post = angular.copy($scope.postData)
      var channelid = item.ChannelId
      post.channelid = channelid
      var url = '/api/download/getchildtaskdetails?' + $.param(post);
    } else {
      var posttotal = {}
      posttotal = angular.copy($scope.postData)
      var url = '/api/download/getchildtaskdetails?' + $.param(posttotal);
    }
    window.open(url)
  }
  // $scope.rightAlign = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  $scope.toExcel = function() {
    Excel.tableToExcel('div[js-height]>#dataTable', '外勤情况统计');
  }
}]);
