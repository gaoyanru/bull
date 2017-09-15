'use strict';

angular.module('channelApp').controller('UpdateOrganizeCtrl', ['$scope', '$uibModalInstance', 'SelectedNode', 'OrganizeService', function($scope, $uibModalInstance, SelectedNode, OrganizeService) {
    $scope.updateParams = angular.copy(SelectedNode);

    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };

    $scope.updateOragnize = function(){
        $scope.submitted = true;
        OrganizeService.addOrganize($scope.updateParams).then(function(res){
            $uibModalInstance.close($scope.updateParams);
        });
    };

    //关闭模态框
    $scope.dismiss = function(){
        $uibModalInstance.dismiss();
    };
}]);
