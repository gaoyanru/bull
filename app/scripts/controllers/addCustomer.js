(function() {
    angular.module('channelApp').controller('AddCustomerCtrl', ['$scope', '$uibModalInstance', 'CustomerService', 'customer', 'user', function($scope, $uibModalInstance, server, customer, getUser) {

        var user = $scope.user = getUser.get();

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
                Mobile: customer.Mobile,
                CustomerTypeId: customer.CustomerTypeId,
                SalesId: customer.SalesId
            };
        }

        vm.options = {};
        vm.Category = user.Category;
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
                required: true
            }
        }, {
            key: 'Mobile',
            type: 'input',
            templateOptions: {
                label: '电话',
                required: true,
                maxlength:11
            }
        }, {
            key: 'CustomerTypeId',
            type: 'select',
            templateOptions: {
                label: '客户类型',
                options: [],
                valueProp: 'CustomerTypeId',
                labelProp: 'Name',
                required: true
            },
            controller: ['$scope', function($scope) {
                $scope.to.loading = server.custype().success(function(result) {
                    $scope.to.options = result.data;
                    return result.data;
                });
            }],
            watcher: {
                expression: 'model.CustomerTypeId',
                listener: function(obj, newVal, oldVal) {
                    if (newVal == 5) {
                        vm.model.SalesId = '';
                    }
                }
            }
        }
        // ,{
        //     key: 'SalesId',
        //     type: 'select',
        //     templateOptions: {
        //         label: '销售人员',
        //         options: [],
        //         valueProp: 'UserId',
        //         labelProp: 'RealName'
        //     },
        //     controller: ['$scope', function($scope) {
        //         if (user.Category == 6) {
        //             vm.model.SalesId = user.UserId;
        //         } else {
        //             $scope.to.loading = server.sales().success(function(result) {
        //                 $scope.to.options = result.data;
        //                 return result.data;
        //             });
        //         }

        //     }],
        //     hideExpression: 'Category == 6 || model.CustomerTypeId==5',
        //     expressionProperties: {
        //         'templateOptions.required': 'model.CustomerTypeId <5'
        //     },
        //     defaultValue: ''
        // }
        ];
        $scope.save = function() {
            if ($scope.vm.form.$invalid) {
                alert('请检查输入项目!');
                return;
            }
            if (vm.model.CustomerTypeId === 5) vm.model.SalesId = '';
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
