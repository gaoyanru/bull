'use strict';

angular.module('channelApp').factory('OrderSearchService', ['$http', '$q','PyCapital', function($http, $q,PyCapital) {

    return {
        getArea: _getArea,
        getOrder: _getOrder,
        getAgent: _getAgent
    };

    /*
    * params: province || city
    * */
    function _getArea(params){
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
    * 获取order
    * */
    function _getOrder(params){
        var defer=$q.defer();

        var param = {
            url: '/api/orders/agent',
            method: 'GET',
            params: params
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
    * 获取代理
    * */
    function _getAgent(){
        var defer=$q.defer();

        var param = {
            url: '/api/agent/dict',
            method: 'GET'
        };

        $http(param)
            .success(function(data,status,headers,config){
                data.data = _.map(data.data, function(item) {
                    item.py = PyCapital.getCaptial(item.ChannelName);
                    return item;
                });
                defer.resolve(data);
            })
            .error(function(data,status,headers,config){
                defer.reject();
            });

        return defer.promise;
    }
  }]);
