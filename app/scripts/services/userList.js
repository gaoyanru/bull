'use strict';

angular.module('channelApp').factory('UserListService', ['$http', '$q', function($http, $q) {

    var url = '/api/account';

    /*
    * checkExist: 检查用户名是否存在
    * getUserList: 获取用户列表
    * addUser: 新增用户
    * updateUser: 更新用户
    * delUser: 删除用户
    * getRole: 获取角色,
    * getIndustry: 获取行业
    * getFunction: 获取模块列表
    * getFunctionByRole
    * */
    return {
        getUserList: _getUserList,
        addUser: _addUser,
        updateUser: _updateUser,
        delUser: _delUser,
        checkExist: _checkExist,
        getDictionary: _getDictionary,
        getFunction: _getFunction,
        getFunctionByRole: _getFunctionByRole
    };


    /*
    * params : {
    *   method: 'GET',
    *   url: '/api/account'
    *   params: {
    *       offset: 0,
    *       limit: 10
    *   }
    * }
    * */
    function _getUserList(params){

        var defer=$q.defer();

        params = angular.extend(params, {
            url: url + '/' + params.DepartmentId
        });

        $http(params)
        .success(function(data,status,headers,config){
            defer.resolve(data);
        })
        .error(function(data,status,headers,config){
            defer.reject();
        });

        return defer.promise;
    }

    /*
     * params : {
     *   method: 'POST',
     *   url: '/api/account'
     *   data: {
     *      UserName: '',
     *      .... : ...
     *      .... : ...
     *   }
     * }
     * */
    function _addUser(params){
        var defer=$q.defer();

        var param = {
            url: url,
            method: 'POST',
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

    /*
     * params : {
     *   method: 'POST',
     *   url: '/api/account'
     *   data: {
     *      UserName: '',
     *      .... : ...
     *      .... : ...
     *   }
     * }
     * */
    function _updateUser(params){
        var defer=$q.defer();

        var param = {
            url: url + '/' + params.UserId,
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

    /*
    *
    * */

    function _delUser(params){
        var defer=$q.defer();

        $http({
            url: url + '/' + params.UserId,
            method: 'DELETE'
        })
        .success(function(data,status,headers,config){
            defer.resolve(data);
        })
        .error(function(data,status,headers,config){
            defer.reject();
        });

        return defer.promise;
    }
    /*
    * params: {
    *   name: ''
    * }
    * */
    function _checkExist(params){
        var defer=$q.defer();

        $http({
            url: url + '/exist/' + params.name
        })
        .success(function(data,status,headers,config){
            defer.resolve(data);
        })
        .error(function(data,status,headers,config){
            defer.reject();
        });

        return defer.promise;
    }


    /*
    * params:role || industry
    * */
    function _getDictionary(params){
        var defer=$q.defer();
        if(window.sessionStorage && angular.isString(window.sessionStorage.getItem(params))){
            defer.resolve(angular.fromJson(window.sessionStorage.getItem(params)));
        }else{
            $http({
                url: '/api/code/' + params
            })
            .success(function(res,status,headers,config){
                if(angular.isArray(res.data)){
                    window.sessionStorage.setItem(params, angular.toJson(res.data));
                    defer.resolve(res.data);
                }else{
                    defer.resolve([]);
                }
            })
            .error(function(data,status,headers,config){
                defer.reject();
            });
        }
        return defer.promise;
    }

    /*
     * 获取模块列表
     *
     * */
    function _getFunction(){
        var defer=$q.defer();
        if(window.sessionStorage && angular.isString(window.sessionStorage.getItem('Function'))){
            defer.resolve(angular.fromJson(window.sessionStorage.getItem('Function')));
        }else{
            $http({
                url: 'api/account/function'
            })
            .success(function(res,status,headers,config){
                if(angular.isArray(res.data)){
                    window.sessionStorage.setItem('Function', angular.toJson(res.data));
                    defer.resolve(res.data);
                }else{
                    defer.resolve([]);
                }
            })
            .error(function(data,status,headers,config){
                defer.reject();
            });
        }
        return defer.promise;
    }


    function _getFunctionByRole(role){
        var defer=$q.defer();
        $http({
            url: 'api/function/' + role,
            method: 'GET'
        })
        .success(function(res,status,headers,config){
            if(angular.isArray(res.data)){
                window.sessionStorage.setItem('Function', angular.toJson(res.data));
                defer.resolve(res.data);
            }else{
                defer.resolve([]);
            }
        })
        .error(function(data,status,headers,config){
            defer.reject();
        });
        return defer.promise;
    }

 }]);
