'use strict';

angular.module('channelApp').factory('InvoiceService', ['$http', '$q', function($http, $q) {
    var url = '/api/invoice/';

    return {
        getBalance: _getBalance,
        getInvoiceType: _getInvoiceType,
        applyInvoice: _applyInvoice,
        getApplyLists: _getApplyLists,
        getIssueLists: _getIssueLists,
        getDetail: _getDetail,
        getAddress: _getAddress,
        getProject: _getProject,
        getEffective: function() {
            var defer = $q.defer();

            $http({
                    url: url + 'invoiceLastmonth',
                    method: 'GET'
                })
                .success(function(data, status, headers, config) {
                    defer.resolve(data);
                })
                .error(function(data, status, headers, config) {
                    defer.reject();
                });

            return defer.promise;
        },
        delete: function(id){
           return $http.put('/api/invoice/deleteinvoice/'+id)
        }
    };

    /*
     * 获取可开发票额度
     * */
    function _getBalance() {
        var defer = $q.defer();

        $http({
                url: url + 'balance',
                method: 'GET'
            })
            .success(function(data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function(data, status, headers, config) {
                defer.reject();
            });

        return defer.promise;
    }

    /*
     获取发票类型
     * params : invoiceType
     * */
    function _getInvoiceType() {
        var defer = $q.defer();
        if (window.sessionStorage && angular.isString(window.sessionStorage.getItem('invoiceType'))) {
            defer.resolve(angular.fromJson(window.sessionStorage.getItem('invoiceType')));
        } else {
            $http({
                    url: url + 'type'
                })
                .success(function(res, status, headers, config) {
                    if (angular.isArray(res.data)) {
                        window.sessionStorage.setItem('invoiceType', angular.toJson(res.data));
                        defer.resolve(res.data);
                    } else {
                        defer.resolve([]);
                    }
                })
                .error(function(data, status, headers, config) {
                    defer.reject();
                });
        }
        return defer.promise;
    }

    /*
     * 申请发票
     * */
    function _applyInvoice(params) {
        var defer = $q.defer();

        var param = {
            url: '/api/invoice/addinvoice',
            method: 'POST',
            data: params
        };
        if(params.InvoiceId){
          param.url = '/api/invoice/putinvoice';
          param.method = 'PUT';
          params.Status = 1;
        }

        $http(param)
            .success(function(data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function(data, status, headers, config) {
                defer.reject();
            });

        return defer.promise;
    }

    /*
     *获取发票申请列表
     * */
    function _getApplyLists(params) {
        var defer = $q.defer();

        var param = {
            url: url,
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

    /*
     *获取已开具发票列表
     * */
    function _getIssueLists(params) {
        var defer = $q.defer();

        var param = {
            url: url + 'issue',
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

    /*
     * 获取发票详情
     * */
    function _getDetail(params) {
        var defer = $q.defer();

        var param = {
            url: url + params.id,
            method: 'GET'
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

    /*
     * 获取发票地址
     * */
    function _getAddress() {

        var defer = $q.defer();

        var param = {
            url: '/api/address',
            method: 'GET'
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

    /*
     * 获取发票项目
     * */

    function _getProject() {
        var defer = $q.defer();
        if (window.sessionStorage && angular.isString(window.sessionStorage.getItem("project"))) {
            defer.resolve(angular.fromJson(window.sessionStorage.getItem('project')));
        } else {
            $http({
                    url: url + 'project'
                })
                .success(function(res, status, headers, config) {
                    if (angular.isArray(res.data)) {
                        window.sessionStorage.setItem('project', angular.toJson(res.data));
                        defer.resolve(res.data);
                    } else {
                        defer.resolve([]);
                    }
                })
                .error(function(data, status, headers, config) {
                    defer.reject();
                });
        }
        return defer.promise;
    }
}]);
