'use strict';
angular.module('channelApp').provider('user', function() {
    var acUser = {
        get: function(){
             var userStr = sessionStorage.getItem('user');
            if (!userStr) location.href = "#/login";
            return JSON.parse(userStr);
        },
        set: function(){
            sessionStorage.setItem('user', JSON.stringify(obj));
        }
    };
    this.$get = [function() {
        var userStr = sessionStorage.getItem('user');
        if (!userStr) location.href = "#/login";
        return acUser;
    }];
    this.set = function(obj) {
        sessionStorage.setItem('user', JSON.stringify(obj));
    }
});

angular.module('channelApp').factory('UpdatePswdService', ['$http', '$q',  function($http, $q) {
    return {
        update: _update
    };

    function _update(params){
        var defer=$q.defer();

        var param = {
            url: '/api/account/pwd/reset',
            method: 'PUT',
            data: params
        };

        $http(param)
            .success(function(data,status,headers,config){
                defer.resolve(data);
            })
            .error(function(data,status,headers,config){
                defer.reject();
            });

        return defer.promise;
    }
}]);
