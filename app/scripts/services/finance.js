'use strict';

angular.module('channelApp').factory('FinanceService', ['$http', '$q', 'PyCapital', function($http, $q, PyCapital) {

    return {
        getAgent: _getAgent,
        getFinanceDetail: _getFinanceDetail
    };

    /*
     * 获取agent
     * */
    function _getAgent() {
        var url = '/api/agent/dict',
            defer = $q.defer();

        $http({
                url: url
            })
            .success(function(data, status, headers, config) {
                data.data = _.map(data.data, function(item) {
                    item.py = PyCapital.getCaptial(item.ChannelName);
                    return item;
                });
                defer.resolve(data);
            })
            .error(function(data, status, headers, config) {
                defer.reject();
            });

        return defer.promise;
    }

    /*
     * 获取财务明细
     * */
    function _getFinanceDetail(params) {
        var defer = $q.defer();
        var param = {
            url: '/api/finance/detail',
            method: 'GET',
            params: params
        };

        $http(param)
            .success(function(data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function(data, status, headers, config) {
                defer.reject();
            });

        return defer.promise;
    }
}]);
