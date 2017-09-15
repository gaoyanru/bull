(function() {
    angular.module('channelApp').controller('OtherBussnessList', ['$scope', '$uibModal', 'CustomerService', function($scope, $uibModal, server) {

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
            BusinessName: ''
        };
        $scope.search = function() {
            $scope.searchItem.BusinessName = $scope.bsName;
            $scope.searchItem.companyName = $scope.companyName;

            refreshData($scope.searchItem);
        }

        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage
            }, $scope.searchItem);
            server.getObList(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }
        refreshData();
        server.getObNames().success(function(res) {
            $scope.bnames = res.data;
        });
        $scope.delete = function(id){
            server.deleteObById(id).success(function(res){
                if(res.status){
                    refreshData();
                }
            });
        }

    }]);
})(angular);
