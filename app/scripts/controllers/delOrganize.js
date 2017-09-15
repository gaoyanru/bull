'use strict';

angular.module('channelApp').controller('DelOrganizeCtrl', ['$scope', '$uibModalInstance', 'TreeModel', 'OrganizeService', function($scope, $uibModalInstance, TreeModel, OrganizeService) {


    //组织结构
    var formatTree = function(tree, selectedNode){
        if(!angular.isArray(tree)){
            return ;
        }

        angular.forEach(tree, function(item, key){
            if(item.DepartmentId === selectedNode.DepartmentId){
                tree.splice(key, 1);
            }else if(item.childs.length>0){
                formatTree(item.childs, selectedNode);
            }
        });

        return tree;
    };

    //移除要删除的tree结构
    $scope.treeModel = formatTree(TreeModel.treeModel, TreeModel.removedNode);
    $scope.selectedNode = $scope.treeModel[0];
    $scope.removedNode = TreeModel.removedNode;

    // nav tree options
    $scope.treeOptions = {
        nodeChildren: 'childs',
        dirSelectable: true
    };

    // nav tree node selected
    $scope.selectedNodeChange = function(node) {
        $scope.selectedNode = node;
    };
    //关闭模态框
    $scope.dismiss = function(){
        $uibModalInstance.dismiss();
    };

    $scope.delOragnize = function(){
        OrganizeService.delOrganize({
            delId: $scope.removedNode.DepartmentId,
            newId: $scope.selectedNode ? $scope.selectedNode.DepartmentId : ''
        }).then(function(res){
            $uibModalInstance.close(true);
        });
    };
}]);
