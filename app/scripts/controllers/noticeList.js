angular.module('channelApp').controller('NoticeList', ['$scope', '$http', '$filter', '$state', function ($scope, $http, $filter, $state) {
  var noticelists = [];
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
  function getNoticeLists() {
    var data = angular.extend({
      offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
      limit: $scope.paginator.perPage,
      title: '',
      type: 1
    }, data);
    $http.get('/api/notice/getnoticelist?' + jQuery.param(data)).success(function(result) {
        $scope.paginator.total = result.Count;
        $scope.noticelists = result.data;
        console.log($scope.noticelists)
    });
  };
  getNoticeLists();
  // 返回首页
  $scope.goBackHome = function () {
    $state.go('main')
  }
  // 进入详情页
  $scope.noticeDetail = function (id) {
    $state.go('main.noticeDetail', { id: id });
  }
}]).controller('NoticeDetail', ['$scope', '$stateParams', '$http', '$filter', '$state', function ($scope, $stateParams, $http, $filter, $state) {
  $scope.id = $stateParams.id
  $scope.detailData = ''
  console.log($scope.id, '$scope.id')
  $scope.goBackLast = function () {
    console.log($state)
    history.back()
  }
  function getDetail() {
    $http.get('api/notice/getnotice?id=' + $scope.id).success(function(result) {
        $scope.detailData = result.data[0];
    });
  }
  getDetail()
}])
