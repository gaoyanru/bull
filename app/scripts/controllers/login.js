'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('LoginCtrl', ['$scope', '$location', '$http', function($scope, $location, $http) {
    $scope.login = function() {
        var user = $scope.userName;
        var psd = $scope.password;
        if(!(user && psd)){
            alert('请输入用户名和密码!');
            return;
        }
        $http.post("/api/security/login", {
            UserName: user,
            PassWord: psd
        }).success(function(acUser) {
            if (acUser.status === false) {
                //alert(acUser.message);
                return;
            }
            if(acUser.data.IsCenter){
              sessionStorage.setItem('userInfo', JSON.stringify(acUser.data));
              location.href = "/admin.html";
              return;
            }
            sessionStorage.setItem('user', JSON.stringify(acUser.data));
            //$location.path('main');
            location.href = "#/main"
        }).error(function(){
            //$location.path('main');
        });
    };
}]);
