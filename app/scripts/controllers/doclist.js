angular.module('channelApp').controller('Doclist', ['$scope', '$http', '$filter', '$state', function ($scope, $http, $filter, $state) {
  var doclists = [];
  $scope.filename = '';
  $scope.type = 2;
  $scope.paginator = {
      total: 0,
      currentPage: 1,
      perPage: 10,
      userName: '',
      previousText: '上一页',
      nextText: '下一页',
      lastText: '最后一页',
      firstText: '首页'
  };
  $scope.setCurrentPage = function(){
      $scope.paginator.currentPage = $scope.currentPage;
      $scope.pageChanged();
  };
  $scope.pageChanged = function() {
      getFileList()
  };
  // 获取公告列表
  $scope.getFileList = function () {
    var data = angular.extend({
      offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
      limit: $scope.paginator.perPage,
      filename: $scope.filename,
      type: $scope.type
    }, data);
    $http.get('/api/doc/getdoclist?' + jQuery.param(data)).success(function(result) {
        $scope.paginator.total = result.Count;
        $scope.doclists = result.data;
    });
  };
  $scope.getFileList();
  // 返回首页
  $scope.goBackHome = function () {
    $state.go('main')
  }
  // 下载文件
  $scope.download = function (url) {
    window.open(url)
  }
}])
