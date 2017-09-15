'use strict';

angular.module('channelApp').controller('AddUserCtrl', ['$scope', '$stateParams', 'UserListService','$http', function($scope, $stateParams, UserListService,$http) {

    /*
     UserName
     ChannelId
     RealName
     Password
     Mobile
     Email
     RoleId
     DepartmentId
     IsCenter
    * */
    $scope.addParams = {
        UserName: '',
        RealName: '',
        //ChannelId: '',
        Email: '',
        Password: '',
        Mobile: '',
        RoleId: '',
        FunctionList: [],
        DepartmentId: window.sessionStorage.getItem('DepartmentId')
        //IsCenter: 1 //1, 0
    };

    $scope.seletedParent = $scope.$parent.selectedOrganizeTree;

    var initCenter = function(){
        $scope.centerModel = [{
            id: 1,
            name: '中心'
        },{
            id: 0,
            name: ' 渠道'
        }];

        $scope.selectedCenter = $scope.centerModel[0];
        $scope.addParams.IsCenter = $scope.selectedCenter.id;
    };

    //权限配置
    $scope.functionTreeOptions = {
        nodeChildren: 'children',
        dirSelectable: true,
        multiSelection: true
    };
    $scope.selectedFunction = [];
    $scope.functionModel = [];



    var initFunction = function(role){
        UserListService.getFunctionByRole(role).then(function(res){
            $scope.functionModel = res;
            //console.log(res);
        });
    };

    var initRole = function(){
        UserListService.getDictionary('role').then(function(res){
            $scope.rolesModel = res;
            $scope.selectedRole = $scope.rolesModel[0];
            $scope.addParams.RoleId = $scope.selectedRole.RoleId;
            return $scope.addParams.RoleId;
        }).then(function(role){
            initFunction(role);
        });
    };
    var initFQ = function(){ //初始化分区
        $http.get('/api/channelpartition').success(function(res) {
            $scope.fqs = res.data;
        });
    }

    var initAddParams = function(){
        initCenter();
        initRole();
        initFQ();
        //initFunction('2');
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

    $scope.setAddParams = function(type){
        switch (type){
            case 'role':
                $scope.addParams.RoleId = $scope.selectedRole.RoleId;
                initFunction($scope.addParams.RoleId);
                break;
            case 'center':
                $scope.addParams.IsCenter = $scope.selectedCenter.id;
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

    $scope.addUser = function(valid){
        $scope.submitted = true;
        if($scope.loading) return;
        $scope.addParams.FunctionList = angular.toJson(getSelectedFunc(angular.copy($scope.functionModel)));
        $scope.loading = true;
        UserListService.addUser($scope.addParams).then(function(res){
            $scope.loading = false;
            if(res.status){
                alert('新增成功');
            }else{
                // alert(res.message);
            }
        })
    };

}]);



