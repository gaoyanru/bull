'use strict';

angular.module('channelApp').controller('UpdateUserCtrl', ['$scope', '$stateParams', 'UserListService', 'OrganizeService','$http', function($scope, $stateParams, UserListService, OrganizeService,$http) {

    //console.error(angular.fromJson($stateParams.user));
    var userInfo = angular.fromJson($stateParams.user);

    $scope.updateParams = {
        UserId: userInfo.UserId,
        UserName: userInfo.UserName,
        RealName: userInfo.RealName,
        Email: userInfo.Email,
        Password: '',
        Mobile: userInfo.Mobile,
        RoleId: userInfo.RoleId,
        DepartmentId: userInfo.DepartmentId,
        FunctionList: userInfo.FunctionList ? angular.fromJson(userInfo.FunctionList) : [],
        ChannelPartitionId: ""+userInfo.ChannelPartitionId
        //IsCenter: userInfo.IsCenter //1, 0
    };

    /*var initCenter = function(){
        $scope.centerModel = [{
            id: 1,
            name: '中心'
        },{
            id: 0,
            name: ' 渠道'
        }];

        angular.forEach($scope.centerModel, function(item, key){
            if(item.id == $scope.updateParams.IsCenter){
                $scope.selectedCenter = $scope.centerModel[key];
            }
        });
    };*/

    var initRole = function(){
        UserListService.getDictionary('role').then(function(res){
            $scope.rolesModel = res;
            angular.forEach($scope.rolesModel, function(item, key){
                if(item.RoleId == $scope.updateParams.RoleId){
                    $scope.selectedRole = $scope.rolesModel[key];
                }
            });
        });
    };

    var initFQ = function(){ //初始化分区
        $http.get('/api/channelpartition').success(function(res) {
            $scope.fqs = res.data;
        });
    }

    //设置当前用户的权限
    var resetFun = function(source, dest){
        angular.forEach(source, function(item){
            angular.forEach(dest, function(item1, key){
                if(item1.FunctionId === item.FunctionId){
                    item1.selectd = true;
                    if(item.children && item.children.length>0){
                        resetFun(item.children, item1.children);
                    }else{
                        return ;
                    }
                }
            });
        })
    };

    var initFunction = function(){
        $scope.functionTreeOptions = {
            nodeChildren: 'children',
            dirSelectable: true,
            multiSelection: true
        };

        $scope.selectedFunction = [];
        UserListService.getFunction().then(function(res){
            $scope.functionModel = res;

            //$scope.functionModel = angular.extend($scope.functionModel, angular.fromJson(userInfo.FunctionList));

            var selectFunction = userInfo.FunctionList ? angular.fromJson(userInfo.FunctionList) : [];

            resetFun(selectFunction, $scope.functionModel);
            //console.log($scope.functionModel);
        });
    };

    //获取当前用户的组织
    $scope.selectedOrganize = {};
    var getSelectedOrga = function(DepId, organize){
        if(!angular.isArray(organize)){
            return ;
        }

        for(var i= 0, len= organize.length; i<len; i++){
            if(organize[i].DepartmentId == DepId){
                $scope.selectedOrganize = organize[i];
                return ;
            }else{
                if(organize[i].childs && organize[i].childs.length > 0){
                    getSelectedOrga(DepId, organize[i].childs);
                }
            }
        }

    };

    var initOrganize = function(){
        $scope.organizeTreeOptions = {
            nodeChildren: 'childs',
            dirSelectable: true
        };

        //组织结构
        $scope.organizeModel = [{
            DepartmentId : '0',
            DepartmentName : '全部',
            Description: '',
            ParentID: null,
            expanded: true,
            childs: []
        }];

        OrganizeService.getDepart().then(function(res){
            $scope.organizeModel[0].childs = res.data;
            getSelectedOrga(userInfo.DepartmentId, $scope.organizeModel);
        });
    };

    var initAddParams = function(){
        //initCenter();
        initRole();
        initFunction();
        initOrganize();
        initFQ();
    };

    initAddParams();

    //设置父级节点的selectd
    var setParent = function(node, treeData){
        if(!angular.isArray(treeData)){
            return ;
        }

        var parentNode = null,
            selectd = false;
        treeData.forEach(function(item, key){
            if(item.children && item.children.length>0 ){
                item.children.forEach(function(child){
                    if(child.FunctionId === node.FunctionId){
                        parentNode = item;
                    }
                });
            }
        });

        parentNode.children.forEach(function(child){
            if(child.selectd){
                selectd = true;
            }
        });

        parentNode.selectd = selectd;
    };

    //设置节点的selectd
    $scope.setSelectedTree = function(node){
        node.selectd = !node.selectd;

        if(!(node.children && node.children.length > 0)){
            setParent(node, $scope.functionModel);
            return;
        }else{
            node.children.forEach(function(item){
                $scope.setSelectedTree(item);
            });
        }
    };

    //设置选中Department
    $scope.setOrganize = function(node){
        $scope.selectedOrganize = node;
    };

    //获取角色对应的权限
    var getFunctionList = function(roleId){
        UserListService.getFunctionByRole(roleId).then(function(res){
            $scope.functionModel = res;
        });
    };

    $scope.setUpdateParams = function(type){
        switch (type){
            case 'role':
                $scope.updateParams.RoleId = $scope.selectedRole.RoleId;
                getFunctionList($scope.updateParams.RoleId);
                break;
            case 'center':
                $scope.updateParams.IsCenter = $scope.selectedCenter.id;
                break;
        }
    };

    $scope.interacted = function(field) {
        if(field && field.$dirty){
            return $scope.submitted || field.$dirty;
        }
    };

    //获取选中的function节点
    var getSelectedFunc = function(treeData){
        treeData = treeData.filter(function(item, index) {
            return item.selectd;
        });

        treeData.forEach(function(item){
            if(item.children && item.children.length > 0){
                item.children = item.children.filter(function(child, index) {
                    return child.selectd;
                });
            }
        });

        return treeData;
    };


    $scope.updateUser = function(){
        $scope.submitted = true;
        $scope.updateParams.FunctionList = angular.toJson(getSelectedFunc(angular.copy($scope.functionModel)));
        $scope.updateParams.DepartmentId = $scope.selectedOrganize.DepartmentId;
        /*console.error(getSelectedFunc(angular.copy($scope.functionModel)));
        debugger;*/
        $scope.updateParams.ChannelPartitionId = 0;
        UserListService.updateUser($scope.updateParams).then(function(res){
            if(res.status){
                alert('修改成功');
            }else{
                // alert(res.message);
            }
        });
    };

}]);
