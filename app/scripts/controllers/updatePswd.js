'use strict';

angular.module('channelApp').controller('UpdatePswdCtrl', ['$scope', '$uibModalInstance', 'UpdatePswdService', function($scope, $uibModalInstance, UpdatePswdService) {
    $scope.pswdParams = {
        Old: '',
        New: '',
        Confirm: ''
    };


    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };

    //关闭模态框
    $scope.dismiss = function(){
        $uibModalInstance.dismiss();
    };

    $scope.update = function(valid){
        $scope.submitted = true;

        UpdatePswdService.update($scope.pswdParams).then(function(res){
            if(res.status){
                alert('修改成功');
                $scope.dismiss();
            }else{
                // alert(res.message);
            }
        })
    };
}]);
