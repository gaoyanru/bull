angular.module('channelApp').controller('User_outworker', ['$scope', '$http', '$state', '$uibModal', 'user', function($scope, $http, $state, $uibModal, user) {
    $scope.user = user.get();
    $scope.open = function(item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/user_outworker_view.html',
            controller: 'User_outwroker_view',
            size:'lg',
            resolve: { customer: item || {} }
        });
        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    };
    $scope.delete = function(item) {
        if(!confirm('您确定要删除？')) return;
        $http.delete('/api/outworkers/'+item.Id).success(function(res){
            if(res.status) refreshData();
        });
    };

    function refreshData() {
        $http.get('/api/outworkers').success(function(res) {
            $scope.outworkers= res.data;
        });
    }
    refreshData();


}]).controller("User_outwroker_view", ['$scope', '$http', '$uibModalInstance', 'customer', function($scope, $http, $uibModalInstance, customer) {
    $scope.postData = customer || {};

    var pages = [];

    $scope.title = customer.Name || "新增外勤";

    $scope.ok = function(ev) {
        var postData = angular.copy($scope.postData);
        if (!customer.Id) {
            $http.post('/api/outworkers', postData).success(function(res) {
                if (res.status) {
                    $uibModalInstance.close();
                }
            });
        } else {
            $http.put('/api/outworkers/' + customer.Id, postData).success(function(res) {
                if (res.status) {
                    alert('修改成功！');
                    $uibModalInstance.close();
                }
            });
        }

    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    }
}]);
