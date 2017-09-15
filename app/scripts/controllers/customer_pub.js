(function() {
    angular.module('channelApp').controller('CustomerPubList', ['$scope', '$uibModal', 'CustomerService', 'user', 'showDetails', 'FileUploader', '$timeout', function($scope, $uibModal, server, user, showDetails, FileUploader, $timeout) {
        $scope.user = user.get();
        $scope.open = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/addCustomers.html',
                controller: 'CustomerAddPubCtrl',
                size: "lg",
                resolve: {
                    customer: function() {
                        return item;
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function(result) {
                refreshData();
            }, function() {

            });
        };
        $scope.rob = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/customer_rob.html',
                controller: 'CustomerRob',
                size: "lg",
                resolve: {
                    customer: function() {
                        return item;
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function(result) {
                refreshData();
            }, function() {
                refreshData();
            });
        }
        $scope.delete = function(item) {
            if (!confirm('你确认要删除该客户？')) return;
            server.delete(item.CustomerId).success(function() {
                refreshData();
            });
        };
        /*
         * paginator
         * */
        $scope.paginator = {
            total: 0,
            currentPage: 1,
            perPage: 10,
            previousText: '上一页',
            nextText: '下一页',
            lastText: '最后一页',
            firstText: '首页'
        };


        $scope.pageChanged = function() {
            refreshData();
        };

        //set current page
        $scope.setCurrentPage = function() {
            $scope.paginator.currentPage = $scope.currentPage;
            refreshData();
        };
        $scope.searchItem = {
            companyName: '',
            mobile: '',
            HisCusTypeId: 0
        };
        $scope.search = {
            companyName: '',
            mobile: '',
            cusType: 0
        };
        $scope.track = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/customer_track.html',
                controller: 'CustomerTrack',
                size: "lg",
                resolve: {
                    customer: function() {
                        return item;
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function(result) {
                refreshData();
            }, function() {
                refreshData();
            });
        };
        $scope.searchFn = function() {
            $scope.searchItem.companyName = $scope.search.companyName;
            $scope.searchItem.mobile = $scope.search.mobile;
            $scope.searchItem.HisCusTypeId = $scope.search.cusType;
            refreshData($scope.searchItem);
        }

        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage
            }, $scope.searchItem, data);
            server.getCustomer_pub(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }

        $scope.uploader = new FileUploader({
            url: '/api/excelfiles',
            autoUpload: true
        });
        $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
            if (response.hasError) {
                alert(response.message);
                return;
            }
            $timeout(function() {
                if (response.data.length > 0) {
                    showDetails(response.join('<br/>'));
                } else {
                    showDetails("全部导入成功！");
                }
                refreshData();
            }, 500);

        };
        refreshData();
        server.custype().success(function(result) {
            $scope.ctypes = result.data;
        });
    }]).controller('CustomerRob', ['$scope', '$uibModalInstance', 'CustomerService', 'customer', function($scope, $uibModalInstance, server, customer) {

        var vm = $scope.vm = {};
        vm.model = {};
        vm.options = {};
        vm.fields = [{
            key: 'CustomerTypeId',
            type: 'select',
            templateOptions: {
                label: '客户类型',
                options: [],
                valueProp: 'CustomerTypeId',
                labelProp: 'Name'
            },
            controller: ['$scope', function($scope) {
                $scope.to.loading = server.custype().success(function(result) {
                    result.data.pop();
                    $scope.to.options = result.data;
                    return result.data;
                });
            }],
            defaultValue: 4
        }];
        $scope.save = function(item) {
            server.rob(customer.CustomerId, vm.model.CustomerTypeId).success(function(res) {
                if (res.status) {
                    $uibModalInstance.close('cancel');
                } else {
                    $uibModalInstance.close('cancel');
                }
            });
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };


    }]).controller('CustomerAddPubCtrl', ['$scope', '$uibModalInstance', 'CustomerService', 'customer', function($scope, $uibModalInstance, server, customer) {

        var vm = $scope.vm = {};
        vm.model = {};
        if (customer) {
            vm.model = {
                CustomerId: customer.CustomerId,
                Name: customer.Name,
                CityCode: customer.CityCode,
                Address: customer.Address,
                Industry: customer.Industry,
                AddedValue: customer.AddedValue,
                Contacts: customer.Contacts,
                Mobile: customer.Mobile
            };
        }

        vm.options = {};

        vm.fields = [{
            key: 'Name',
            type: 'input',
            templateOptions: {
                label: '公司名称',
                required: true,
            }
        }, {
            key: 'CityCode',
            type: 'select',
            templateOptions: {
                label: '城市',
                required: true,
                options: [],
                valueProp: 'CityCode',
                labelProp: 'CityName'
            },
            controller: ['$scope', function($scope) {
                $scope.to.loading = server.cities().success(function(result) {
                    $scope.to.options = result.data;
                    return result.data;
                });
            }]
        }, {
            key: 'Address',
            type: 'input',
            templateOptions: {
                label: '公司地址'
            }
        }, {
            key: 'Industry',
            type: 'select',
            templateOptions: {
                label: '公司行业',
                options: [],
                valueProp: 'IndustryId',
                labelProp: 'IndustryName'
            },
            controller: ['$scope', function($scope) {
                $scope.to.loading = server.industry().success(function(result) {
                    $scope.to.options = result.data;
                    return result.data;
                });
            }]
        }, {
            key: 'AddedValue',
            type: 'select',
            templateOptions: {
                label: '公司性质',
                options: [
                    { name: '小规模', value: 1 },
                    { name: '一般纳税人', value: 2 }
                ]
            }
        }, {
            key: 'Contacts',
            type: 'input',
            templateOptions: {
                label: '联系人',
                required: true,
            }
        }, {
            key: 'Mobile',
            type: 'input',
            templateOptions: {
                label: '电话',
                required: true
            }
        }];
        $scope.save = function() {
            if ($scope.vm.form.$invalid) {
                alert('请输入必填项!');
                return;
            }
            vm.model.CustomerTypeId = 5;
            server.save(vm.model).success(function(res) {
                if (res.status) {
                    $uibModalInstance.close('cancel');
                }
            });
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };


    }]);
})(angular);
