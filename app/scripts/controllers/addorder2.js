'use strict';
angular.module('channelApp').controller('AddOrderCtrl2', ['$scope', '$http', '$filter', '$state', '$stateParams', '$uibModal', 'FileUploader', 'user', 'ossUploader', function ($scope, $http, $filter, $state, $stateParams, $uibModal, FileUploader, user, ossUploader) {

  $scope.payTypes = {};
  // 获取代理商账户余额
  function getBanlance() {
    $http.get('api/agent/balance').success(function (result) {
      $scope.balance = result.data;
    })
  }
  getBanlance();

  // 表单提交数据
  $scope.postData = {
    AddedValue: 1,
    Name: '',
    IdentityCardImg: '',
    payType: 28
  }
  $scope.payTypes = [];
  $scope.companyList = [];
  $scope.searchType = 1;   // 1 本地搜索 , 2 检索搜出要查询的公司
  $scope.searchError = "";
  $scope.isReadOnly = false // 是否只读

  $scope.fastCheck = function() { // 快速录入
    var modalInstance = $uibModal.open({
        templateUrl: 'views/addorder_company_modal.html',
        size: "md",
        controller: 'AddorderCompanyModal',
        resolve: {
        }
    });
    modalInstance.result.then(function (result) {
        console.log(result, 'result')
    }, function () {

    });
  }
  $scope.toCheck = function(){
    $scope.searchError = '';
    $scope.searchType = 2;
    if($scope.postData.Name.length < 3){
      $scope.searchError = "请输入准确完整的公司名称！";
      return;
    }
    $scope.getMoreCompanyName($scope.postData.Name, function(){
      $scope.searchError = $scope.companyList.length ? "" : "抱歉，没有检索到公司信息！";
      if($scope.postData.Name == '' || $scope.postData.Name.length < 3 || $scope.companyList.length === 0){
        $('.dropdown-company-list').parent().removeClass('open');
      }else{
        $('.dropdown-company-list').parent().addClass('open');
      }
    })
  }

  $scope.$watch('postData.Name', function(){
    $scope.searchType = 1;
    if($scope.postData.Name.length == ''){
      $('.dropdown-company-list').parent().removeClass('open');
      $scope.searchError = '';
      return;
    }
    if($scope.postData.Name.length < 3){
      $('.dropdown-company-list').parent().removeClass('open');
      return;
    }

    $scope.searchError = ''

    if($scope.companySelected){
      $('.dropdown-company-list').parent().removeClass('open');
      return;
    }

    $scope.getCompanyName($scope.postData.Name, function(){
      if($scope.postData.Name == '' || $scope.postData.Name.length < 3 || $scope.companyList.length === 0){
        $('.dropdown-company-list').parent().removeClass('open');
      }else{
        $('.dropdown-company-list').parent().addClass('open');
      }
    });
  })
  // 本地数据库存在客户模糊检索
  $scope.getCompanyName = function getCompanyName (val, cb) {
    return $http.get('/api/orders/companyname?name=' + encodeURI(val)).then(function (response) {
      var data = response.data;
      if(data.status){
        $scope.companyList = data.data;
        cb && cb();
      }
    })
  }

  // 检索
  $scope.getMoreCompanyName = function getMoreCompanyName (val, cb) {
    $http.get('/api/order/getcustomerlistbyty?size=10&word=' + encodeURI(val)).then(function (response) {
      var data = response.data;
      console.log(data)
      if(data.status){
        for(var i in data.data){
          data.data[i]['Name'] = data.data[i].name;
        }
        $scope.companyList = data.data;
        cb && cb();
      }
    })
  }
  // 本地数据库选择公司带出本地工商信息
  $scope.companySelect = function (name, id) {
    $scope.companySelected = true;
    if($scope.searchType == 1){
      $http.get('/api/orders/company?name=' + encodeURI(name)).success(function (res) {
        var data = res.data[0]
        console.log(data);
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
        $scope.postData = angular.extend($scope.postData, data);
        setTimeout(function(){
          $scope.companySelected = false;
        }, 0)
      })
    } else {
      $http.get('/api/order/getcustomerbyty?code=' + id).success(function (res) {
        var data = res.data
        console.log(data, '$scope.postData')
        if (data.BusnissDeadline) {
          if (data.BusnissDeadline.substr(0, 4) === '0001') {
            data.BusnissDeadline = ""
          } else {
            data.BusnissDeadline = new Date(data.BusnissDeadline)
          }
        } else {
          data.BusnissDeadline = ""
        }
        data.Name = data.CompanyName.trim();
        if (!data.RegisterDate) {
          data.RegisterDate = ""
        } else {
          data.RegisterDate = new Date(data.RegisterDate)
        }
        $scope.postData = angular.extend($scope.postData, data);
        setTimeout(function(){
          $scope.companySelected = false;
        }, 0)
      })
    }
  }


  // 初始化页面加载数据 销售
  function initDict() {
    // 获取销售员信息
    $http.get("/api/orders/sales").success(function (data) {
      $scope.sales = data.data;
    })
    // 获取代理商所在城市信息  及根据所在城市获取服务费
    $http.get('/api/citybychannel').success(function (data) {
      $scope.cities = data.data;
      if (!$scope.postData.CityCode) { // 默认选择第一个城市
        $scope.postData.CityCode = $scope.cities[0].CityCode;
      }
      // 根据所在城市 获取服务费--查看跟修改获取的服务费参数不同需要分开
      if ($scope.isReadOnly) {
        $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode + '&ischeck=1').success(function (data) {
          $scope.payTypes = res.data
        });
      } else {
        $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function (data) {
          $scope.payTypes = res.data
        })
      }

      console.log($scope);
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

  //身份证上传
  $scope.ImgUploader = function(file){
    return ossUploader(file).then(function(res){
      // 此处处理身份证识别
      console.log(res, 'img')
      return res;
    })
  }
  $scope.ImgUploader1 = function(file){
    return ossUploader(file)
  }
  $scope.startDateOptions = {
      formatYear: 'yyyy'
  };
  $scope.endDateOptions = {
      formatYear: 'yyyy'
  };

  $scope.save = function(){
    console.log($scope.postData)
  }

}]).controller('AddorderCompanyModal', ['$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
  $scope.save = function () {
    var obj = { name: 'lili'}
    $scope.httpWord
    $uibModalInstance.close(obj);
  }
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
