'use strict';

angular.module('channelApp').controller('UserListCtrl', ['$scope', '$state', '$stateParams', 'UserListService', function($scope, $state, $stateParams, UserListService) {

	var tbOptions = [{
        header: '用户名',
        col: 'UserName'
    }, {
        header: '姓名',
        col: 'RealName'
    }, {
        header: '手机',
        col: 'Mobile'
    }, {
        header: '邮箱',
        col: 'Email'
    },{
        header: '角色',
        col: 'RoleName'
    },{
        header: '部门',
        col: 'DepartmentName'
    }];

    $scope.headers = getHeaders();


    /*
     * paginator
     * */
    $scope.paginator = {
        total: 0,
        currentPage: 1,
        perPage: 10,
        userName: '',
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };

    //用户列表
    $scope.userItmes = [];

    $scope.pageChanged = function(){
        $scope.DepartmentId = window.sessionStorage.getItem('DepartmentId');
        getResult();
    };

    if($scope.DepartmentId){
        $scope.pageChanged();
    }


    $scope.setCurrentPage = function(){
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };

    $scope.$on('organize.getUsersList', function(evt){
        $scope.pageChanged();
    });

    /*
    * 新增用户
    * */
    $scope.addUser = function(){
        $state.go('main.users.addUser');
    };

     /*
    * 修改用户
    * */
    $scope.update = function(user){
        $state.go('main.users.updateUser', {
            user: angular.toJson(angular.extend(user, {
                DepartmentId: $scope.DepartmentId
            }))
        });
    };

    /*
    * 删除用户
    * */

    $scope.delUser = function(userId){
        var confirms = confirm("确认删除该员工吗?");
        if(confirms){
            UserListService.delUser({
                UserId: userId
            }).then(function(res){
                $scope.pageChanged();
            });
        }
    };

    function getResult(){
        UserListService.getUserList({
            method: 'GET',
            DepartmentId: $scope.DepartmentId,
            params: {
                offset: ($scope.paginator.currentPage-1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage,
                userName: $scope.paginator.userName
            }
        }).then(function(res){
            $scope.paginator.total = res.Count;
            $scope.userItmes = res.data;
        });
    }

    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

}]);



