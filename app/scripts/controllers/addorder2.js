'use strict';
angular.module('channelApp').controller('AddOrderCtrl2', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', function ($scope, $http, $filter, $state, $stateParams, FileUploader, user) {
  // 获取代理商账户余额
  function getBanlance() {
    $http.get('api/agent/balance').success(function (result) {
      $scope.balance = result.data;
    })
  }
  getBanlance()
  // 表单提交数据
  $scope.postData = {}
  // 初始化获取接口数据 销售
  function initDict() {
    $http.get("/api/orders/sales").success(function (data) {
      $scope.sales = data.data;
    })
  }
  initDict()
  // 控制是否预提单 category==1新增 category==2预提单
  $scope.category = 1
  $scope.setCategory = function () {
    if ($scope.postData.OrderId) return
    if ($scope.isNewCompany) {
      $scope.category = 2
    } else {
      $scope.category = 1
    }
  }
  // 是否查看
  // $scope.isReadOnly = false
  // 本地数据库存在客户模糊检索
  $scope.getCompanyName = function (val) {
    console.log(val.length, 'val')
    return $http.get('/api/orders/companyname?name=' + encodeURI(val)).then(function (response) {
      //if($scope.postData.CustomerId) $scope.postData.CustomerId = null;
      return response.data.data.map(function (item) {
          return {
            Name: item.Name
          }
      })
    })
  }
  // 本地数据库选择公司带出本地工商信息
  $scope.companySelect = function ($item, $model, $label, $event) {
    $http.get('/api/orders/company?name=' + encodeURI($label)).success(function (res) {
      var data = res.data[0]
      if (data.SalesId) delete data.SalesId
      if (data.BusnissDeadline) {
        if (data.BusnissDeadline.substr(0, 4) === '0001') {
          data.BusnissDeadline = ""
        } else {
          data.BusnissDeadline = new Date(data.BusnissDeadline)
        }
      } else {
        data.BusnissDeadline = ""
      }

      data.Name = data.Name.trim();
      data.AddedValue = "" + data.AddedValue
      if (!data.RegisterDate) {
        data.RegisterDate = ""
      } else {
        data.RegisterDate = new Date(data.RegisterDate)
      }
      $scope.postData = angular.extend($scope.postData, data)
    })
  }
  // 点击检索搜出要查询的公司
  $scope.imgSrc1 = '';
  $scope.imgSrc2 = '';

  $scope.startDateOptions = {
      formatYear: 'yyyy'
  };
  $scope.endDateOptions = {
      formatYear: 'yyyy'
  };

  $scope.save = function(){
    console.log($scope)
  }
}]);
