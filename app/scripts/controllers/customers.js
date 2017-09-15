(function() {
    angular.module('channelApp').controller('CustomerList', ['$scope', '$uibModal', 'CustomerService', function($scope, $uibModal, server) {

        $scope.open = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/addCustomers.html',
                controller: 'AddCustomerCtrl',
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
        $scope.delete = function(item) {
            server.delete(item.CustomerId);
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
        }
        $scope.forward = function(item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/customer_forword.html',
                controller: 'CustomerForward',
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
        }

        $scope.paginator = {
            total: 0,
            currentPage: 1,
            perPage: 10,
            previousText: '上一页',
            nextText: '下一页',
            lastText: '最后一页',
            firstText: '首页'
        };

        $scope.searchParams = {
            limit: 10,
            offset: 0,
            start: '',
            end: '',
            status: 0,
            cusname: '',
            cid: ''
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
            mobile:'',
            CustomerTypeId:''
        };
        $scope.search = function() {
            $scope.searchItem.companyName = $scope.companyName;
            $scope.searchItem.mobile = $scope.mobile;
            $scope.searchItem.CustomerTypeId= $scope.cusType;
            refreshData($scope.searchItem);
        }

        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage
            }, $scope.searchItem, data);
            server.getCustomers(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }
        refreshData();
        server.custype().success(function(result) {
            $scope.ctypes = result.data;
        });

    }]).controller('CustomerTrack', ['$scope', '$filter', '$uibModalInstance', 'CustomerService', 'customer', 'user', function($scope, $filter, $uibModalInstance, server, customer, user) {
        $scope.title = customer.Name;
        $scope.user = user.get();
        $scope.dateOptions = {
            formatYear: 'yyyy',
            maxDate: new Date()
        };
        $scope.TrackDate = new Date();
        $scope.today = $filter('date')($scope.TrackDate,'yyyy-MM-dd');
        $scope.save = function() {
            if (!$scope.content) return;
            if (!$scope.TrackDate) {
                alert('请选择跟踪日期！');
            }
            var data = {
                CustomerId: customer.CustomerId,
                Description: $scope.content,
                TrackDate: $filter('date')($scope.TrackDate, 'yyyy-MM-dd')
            };
            server.saveTrack(data).success(function() {
                $scope.content = "";
                refresh();
            });
        };

        $scope.delete = function(track) {
            if (!confirm('确认要删除吗？')) return;
            server.trackDelete(track.TrackId).success(function() {
                refresh();
            });
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        function refresh() {
            server.getTrack(customer.CustomerId).success(function(res) {
                $scope.tracks = res.data;
            });
        }
        refresh();

    }]).controller('CustomerForward', ['$scope', '$uibModalInstance', 'CustomerService', 'customer', 'user', function($scope, $uibModalInstance, server, customer, user) {
        var saler = user.get();
        var vm = $scope.vm = {};
        vm.model = {};
        vm.options = {};
        vm.fields = [{
            key: 'SalesId',
            type: 'select',
            templateOptions: {
                label: '销售人员',
                options: [],
                valueProp: 'UserId',
                labelProp: 'RealName'
            },
            controller: ['$scope', function($scope) {
                $scope.to.loading = server.sales().success(function(result) {
                    var data = result.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].UserId == saler.UserId) {
                            data.splice(i, 1);
                        }
                    }
                    $scope.to.options = data;
                    return result.data;
                });
            }]
        }];
        $scope.save = function(item) {
            if (!vm.model.SalesId) {
                alert('请选择销售人员!');
                return;
            }
            server.forward(customer.CustomerId, vm.model.SalesId).success(function(res) {
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
