'use strict';

angular.module('channelApp').factory('OrganizeService', ['$http', '$q', function($http, $q) {

    var url = '/api';

    /*
    * getDepart: 获取组织机构
    * */
    return {
        getDepart: _getDepart,
        addOrganize: _addOrganize,
        updateOrganize: _updateOrganize,
        delOrganize: _delOrganize
    };

    /*
     * 获取组织结构
     * */
    function _getDepart(){
        var defer=$q.defer();

        $http({
            url: url + '/departments'
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
    * 新增组织结构
    * */
    function _addOrganize(params){
        var defer=$q.defer();

        var param = {
            url: url + '/departments',
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
     * 修改组织结构
     * */
    function _updateOrganize(params){
        var defer=$q.defer();

        var param = {
            url: url + '/departments',
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
     * 删除组织结构
     * */
    function _delOrganize(params){
        var defer=$q.defer();

        var param = {
            url: url + '/departments/' + params.delId + '/' + params.newId,
            method: 'DELETE'
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
