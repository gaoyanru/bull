'use strict';

angular.module('channelApp').controller('UserCtrl', ['$scope', '$state', '$uibModal', 'UserListService', 'OrganizeService', function($scope, $state, $uibModal, UserListService, OrganizeService) {


    //组织结构
    $scope.organizeTreeModel = [{
        DepartmentId : '0',
        DepartmentName : '全部',
        Description: '',
        ParentID: null,
        expanded: true,
        childs: []
    }];

    OrganizeService.getDepart().then(function(res){
        $scope.organizeTreeModel[0].childs = res.data;

        $scope.selectedNodeChange($scope.organizeTreeModel[0]);
        $scope.expandNodes = [$scope.organizeTreeModel[0]];
    });


    // nav tree options
    $scope.organizeTreeOptions = {
        nodeChildren: 'childs',
        dirSelectable: true
    };

    // nav tree node selected
    $scope.selectedNodeChange = function(node) {
        $scope.selectedOrganizeTree = node;
        if(node.DepartmentId !== null){
            window.sessionStorage.setItem('DepartmentId', $scope.selectedOrganizeTree.DepartmentId);
            $state.go('main.users.usersList');
            $scope.$broadcast('organize.getUsersList');
        }
    };

    $scope.refreshUserList = function(){
        $scope.$broadcast('organize.getUsersList');
    };


    //新增组织机构
    $scope.addOragnize = function(root){
        var addModal = $uibModal.open({
            templateUrl: 'views/addOrganize.html',
            controller: 'AddOrganizeCtrl',
            resolve: {
                SelectedNode: function () {
                    return root === 'root' ? null : $scope.selectedOrganizeTree;
                }
            }
        });

        addModal.result.then(function (newNode) {
            if(newNode){
                OrganizeService.getDepart().then(function(res){
                    $scope.organizeTreeModel = res.data;
                });
            }
        }, function () {
            console.info('Modal dismissed at: ' + new Date());
        });
    };

    //重新赋值修改后的组织机构
    var resetSelectedOrganize = function(tree, updateNode){
        if(!angular.isArray(tree)){
            return tree;
        }

        angular.forEach(tree, function(item, key){
            if(item.DepartmentId === updateNode.DepartmentId){
                item = angular.extend(item, updateNode);
                $scope.selectedOrganizeTree = item;
            }else if(item.childs.length>0){
                resetSelectedOrganize(item.childs, updateNode);
            }
        });
    };
    //修改组织机构
    $scope.updateOragnize = function(){
        if($scope.selectedOrganizeTree.DepartmentId === null){
            alert('不允许修改！');
            return ;
        }
        var updateModal = $uibModal.open({
            templateUrl: 'views/updateOrganize.html',
            controller: 'UpdateOrganizeCtrl',
            resolve: {
                SelectedNode: function () {
                    return $scope.selectedOrganizeTree;
                }
            }
        });

        updateModal.result.then(function (updateNode) {
            resetSelectedOrganize($scope.organizeTreeModel, updateNode);
        }, function () {
            console.info('Modal dismissed at: ' + new Date());
        });
    };

    //修改组织机构
    $scope.delOragnize = function(){
        if(($scope.organizeTreeModel[0].childs.length <= 1 && $scope.selectedOrganizeTree.ParentID === 0) || $scope.selectedOrganizeTree.DepartmentId === null){
            alert('不允许删除!');
            return ;
        }
        var delModal = $uibModal.open({
            templateUrl: 'views/delOrganize.html',
            controller: 'DelOrganizeCtrl',
            resolve: {
                TreeModel: function () {
                    return {
                        treeModel: angular.copy($scope.organizeTreeModel[0].childs),
                        removedNode: $scope.selectedOrganizeTree
                    };
                }
            }
        });

        delModal.result.then(function (delFlag) {
            if(delFlag){
                OrganizeService.getDepart().then(function(res){
                    $scope.organizeTreeModel = res.data;
                    $scope.selectedOrganizeTree = $scope.organizeTreeModel[0];
                    $state.go('main.users.usersList');
                });
            }
        }, function () {
            console.info('Modal dismissed at: ' + new Date());
        });
    };



}]);
