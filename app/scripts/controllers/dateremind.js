(function() {
    angular.module('channelApp').controller('DateRemind', ['$scope', '$uibModal', 'CustomerService', 'user','$state', function($scope, $uibModal, server, user,$state) {
        $scope.user = user.get();
        $scope.view = function(orderId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/addOrder.html',
                controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                    $scope.readonly = true;
                    $scope.orderId = orderId;
                    $scope.showClose = true;
                    $scope.close = function() {
                        $uibModalInstance.dismiss('');
                    }
                }],
                size: "lg"
            });
        };

        $scope.add = function(cusid,ld) {
            $state.go('^.addOrder', { orderId: 'C' + cusid + '&'+ld });
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
            monthcount: '1'
        };
        $scope.search = function() {
            $scope.searchItem.monthcount = $scope.limit;
            refreshData($scope.searchItem);
        }

        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage
            }, $scope.searchItem);
            server.getCustomerRemind(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }
        $scope.limit = "1";
        refreshData();
    }]);
})(angular);
