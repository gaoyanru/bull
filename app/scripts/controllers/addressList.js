'use strict';

~function(angular) {
    var tbOptions = [{
        header: '省',
        col: 'ProvinceName',
        realCol: 'ProvinceCode',
        type: 'acSelect',
        options: {
            url: '/api/code/province',
            label: 'Name',
            id: 'Code',
            hasDefault: true
        }
    }, {
        header: '市',
        col: 'CityName',
        realCol: 'CityCode',
        type: 'acSelect',
        options: {
            url: '/api/code/city',
            label: 'Name',
            id: 'Code',
            watchField: 'ProvinceCode',
            paramStr: '?pcode={val}',
            hasDefault: true
        }
    }, {
        header: '名称',
        col: 'Name',
        type: 'text'
    }, {
        header: '接收人',
        col: 'Receiver',
        type: 'text'
    }, {
        header: '联系方式',
        col: 'Mobile',
        type: 'text'
    }, {
        header: '地址',
        col: 'Address',
        type: 'text'
    }];
    angular.module('channelApp').controller('AddressListCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {

        $scope.headers = getHeaders();

        function getHeaders() {
            return tbOptions.map(function(item) {
                return item.header
            });
        }

        function formateData(data) {

            data.forEach(function(row) {
                var cols = [];
                tbOptions.forEach(function(item) {
                    var cv = (item.formate ? item.formate(row[item.col]) : row[item.col]) || "无";
                    cols.push(cv);
                });
                row.cols = cols;
            });
            return data;
        }

        function refreshData() {
            $http.get('/api/address').success(function(result) {
                $scope.data = formateData(result.data);
            });
        }
        refreshData();
        $scope.open = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/cmFormModal.html',
                size: "lg",
                controller: 'AddressModalCtrl',
                resolve: {
                    item: function() {
                        return item || {};
                    }
                }
            });

            modalInstance.result.then(function(result) {
                refreshData();
            }, function() {

            });
        };


    }]).controller('AddressModalCtrl', ['$scope', '$uibModalInstance', '$http', 'item', function($scope, $uibModalInstance, $http, item) {
        $scope.item = item || {};
        $scope.title = "地址管理";
        $scope.settings = tbOptions;
        $scope.ok = function() {
            console.log($scope.item, '$scope.item')
            if ($scope.item.Id) {
                $http.put('/api/address/' + $scope.item.Id, $scope.item).success(callback);
            } else {
                $http.post('/api/address', $scope.item).success(callback);
            }

            function callback(result) {
                if (result.status) $uibModalInstance.close();
            }
        }
        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        }
    }]);
}(angular);
