'use strict';

angular.module('channelApp').controller('AddOrganizeCtrl', ['$scope', '$uibModalInstance', 'SelectedNode', 'OrganizeService', function($scope, $uibModalInstance, SelectedNode, OrganizeService) {

    $scope.addParams = {
        DepartmentId: 0,
        DepartmentName: '',
        Description: '',
        ParentID: SelectedNode ? SelectedNode.DepartmentId : 0
    };

    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };

    $scope.addOragnize = function(){
        $scope.submitted = true;
        if($scope.loading) return;
        $scope.loading = true;
        OrganizeService.addOrganize($scope.addParams).then(function(res){
            $uibModalInstance.close(true);
        });
    };

    //关闭模态框
    $scope.dismiss = function(){
        $uibModalInstance.dismiss();
    };
}]);
