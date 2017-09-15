angular.module('channelApp').controller('OtherBussnessAdd', ['$scope', '$http', '$filter', '$state', '$stateParams', 'CustomerService', 'user', function($scope, $http, $filter, $state, $stateParams, server, user) {
    $scope.postData = {};

    
    var orderId = $stateParams.orderId || $scope.$parent.orderId || false;

    if(orderId){
        server.getObById(orderId).success(function(res){
            $scope.postData = angular.extend(res.data,res.data.Customer);
            $scope.postData.SaleId = "" + $scope.postData.SaleId;
            $scope.postData.AddedValue = "" + $scope.postData.AddedValue;
            $scope.postData.Industry = "" + $scope.postData.Industry;
            initDict();
        });
    }else{
        initDict();
    }

     $scope.getCompanyName = function(val) {
        return $http.get('/api/orders/companyname?name=' + val).then(function(response) {
            return response.data.data.map(function(item) {
                return { Name: item.Name };
            });
        });
    };
    $scope.companySelect = function($item, $model, $label, $event) {
        $http.get('/api/orders/company?name=' + $label).success(function(res) {
            var data = res.data[0];
            delete data.SalesId;
            data.Name = data.Name.trim();
            data.AddedValue = "" + data.AddedValue;
            data.Industry = "" + data.Industry;
           
            $scope.postData = angular.extend($scope.postData, data);
        });
    }
    function initDict() {
        $http.get("/api/code/industry").success(function(data) {
            $scope.industries = data.data;
            //$scope.postData.AddedValue = '1';
        });
        $http.get("/api/citybychannel").success(function(data) {
            $scope.cities = data.data;
            if ($scope.cities.length === 1) {
                $scope.postData.CityCode = $scope.cities[0].CityCode;
            }
        });

        $http.get("/api/orders/sales").success(function(data) {
            $scope.sales = data.data;
            $scope.postData.SaleId = "" + data.data[0].UserId;
        });

        server.getObNames().success(function(res) {
            $scope.bnames = res.data;
        });

    }

    $scope.save = function(){
        $scope.submited = true;
        if (!$scope.postData.SaleId) {
            alert('请先选择销售人员！');
            return;
        }
        if ($scope.loading) return;
        if ($scope.myForm.$invalid) {
            alert("请补充必填项！");
            return;
        }

        var params = {
            url: '/api/cusregister',
            data: $scope.postData,
            method: "post"
        }

        if ($scope.postData.Id) {
            params.method = "put";        
        }
        $scope.loading = true;
        $http(params).success(function(result) {
            if (result.status) {
                alert('操作成功！');
                $state.go('^.oblist');
                // if ($scope.isModal) {
                //     $scope.closeModal();
                // } else {
                //     $state.go('^.orderList');
                // }
                // $scope.postData = {};
            } else {
                // alert(result.message);
            }
            $scope.loading = false;
        }).error(function() {
            $scope.loading = false;
        });
    }
}]);
