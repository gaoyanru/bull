(function() {
    angular.module('channelApp').controller('CustomerTotal', ['$scope', 'CustomerService', '$uibModal', function($scope, server, $uibModal) {
        server.getCustomer_total().success(function(res) {
            $scope.customers = res.data;
            var aAType = 0,
                aBType = 0,
                aCType = 0,
                aDType = 0,
                aBillType=0;
            _.each(res.data,function(item){
                aAType += item.AType;
                aBType += item.BType;
                aCType += item.CType;
                aDType += item.DType;
                aBillType += item.BillType;
            });
            $scope.aAType = aAType;
            $scope.aBType = aBType;
            $scope.aCType = aCType;
            $scope.aDType = aDType;
            $scope.aBillType = aBillType;
        });
        $scope.viewDetail = function(userId, type) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/customers_modal.html',
                controller: 'customersModal',
                size: "lg",
                resolve: {
                    params: function() {
                        return {
                            UserId: userId,
                            Type: type
                        };
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function(result) {
                refreshData();
            }, function() {

            });
        }
    }]).controller('customersModal', ['$scope', 'CustomerService', '$uibModalInstance','params','$uibModal', function($scope, server, $uibModalInstance,params,$uibModal) {
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.ok = function() {
            $uibModalInstance.close('');
        };
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


        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage,
                custype: params.Type,
                userid: params.UserId
            }, $scope.searchItem, data);
            server.getCustomersByDetail(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }
        refreshData();

    }]);
})(angular);
