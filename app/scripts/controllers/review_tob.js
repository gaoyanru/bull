angular.module('channelApp').controller('ReviewTobCtrl', ['$scope', '$http', '$filter', '$uibModal','PyCapital', function($scope, $http, $filter, $uibModal,PyCapital) {
    'use strict';
    $scope.title = "记账审核";
    var tbOptions = [{
        header: '省',
        col: 'ProvinceName',
    }, {
        header: '市',
        col: 'CityName',
    }, {
        header: '一级代理商',
        col: 'ChannelName1',
    }, {
        header: '二级代理商',
        col: 'ChannelName2',
    }, {
        header: '公司名称',
        col: 'Name',
    }, {
        header: '订单编号/合同号',
        col: 'OrderId,ContractNO',
    }, {
        header: '订单日期',
        col: 'CreateDate',
        formate: function(val) {
            return val.substr(0, 10);
        }
    }];

    $scope.headers = getHeaders()
    
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

    $scope.channelId = undefined;
    $scope.status = 1;

    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };


    $scope.pageChanged = function() {
        refreshData($scope.searchItem);
    }

    $scope.searchItem = getSearchItem();

    $scope.searchFn = function() {
        $scope.searchItem = getSearchItem();
        refreshData($scope.searchItem);
    }

    $scope.sdateOptions = {
        formatYear: 'yyyy'
    };
    $scope.edateOptions = {
        formatYear: 'yyyy'
    };
    $scope.setMinDate = function() {
        $scope.edateOptions.minDate = $scope.startdate;
    }
    $scope.reset = function() {
        $scope.channelId = undefined;
        $scope.status = 1;
        $scope.startdate = "";
        $scope.enddate = "";
    }
    $scope.audit = function(order) {
        $http.put('/api/orderszj2/audit/' + order.OrderId).success(function(result) {
            if(result.status) alert('操作成功！');
            $scope.searchFn();
        });
    };

    $scope.back = function(orderId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/invoiceReject.html',
            controller: ['$scope', '$http', '$filter', '$uibModalInstance', function($scope, $http, $filter, $uibModalInstance) {
                $scope.invoice = {};
                //invoice.AuditMsg
                $scope.title = "拒绝提单";
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('');
                };
                $scope.ok = function() {
                    if($scope.loading) return;
                    var item = {
                        id : orderId,
                        BackReason: $scope.invoice.AuditMsg
                    };
                    $scope.loading = true;
                    $http.put('/api/orders/back',item).success(function() {
                        $uibModalInstance.close();
                    });
                };
            }]
        });
        modalInstance.result.then(function() {
            refreshData();
        });
        // $http.put('/api/orders/back/' + orderId).success(function(result) {
        //     $scope.searchFn();
        // });
    };
    $scope.view = function(orderId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/addOrder.html',
            controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                $scope.readonly = true;
                $scope.orderId = orderId;
                $scope.showClose = true;
                $scope.close = function() {
                    $uibModalInstance.dismiss('');
                }
            }],
            size: "lg"
        });
    }

    $http.get('/api/agent/dict').success(function(result) {
        $scope.agents = _.map(result.data,function(item) {
            item.py = PyCapital.getCaptial(item.ChannelName);
            return item;
        });
        $scope.searchFn();
    });

    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {

        data.forEach(function(row) {
            var cols = [];
            tbOptions.forEach(function(item) {
                if (item.col.indexOf(',') > 0) {
                    var c = item.col.split(',');
                    var cv0 = (item.formate ? item.formate(row[c[0]]) : row[c[0]]) || "无";
                    var cv1 = (item.formate ? item.formate(row[c[1]]) : row[c[1]]) || "无";
                    cols.push(cv0 + '<br/>' + cv1);
                } else {
                    var cv = (item.formate ? item.formate(row[item.col]) : row[item.col]) || "无";
                    cols.push(cv);
                }
            });
            row.cols = cols;
        });
        return data;
    }

    function getSearchItem() {
       if($scope.channel && !$scope.channel.ChannelId){
            alert('请选择渠道！');
            $scope.channel = undefined;
            return;
        }
        var searchItem = {
            cid: ($scope.channel && $scope.channel.ChannelId)||undefined,
            start: $filter('date')($scope.startdate, 'yyyy-MM-dd'),
            end: $filter('date')($scope.enddate, 'yyyy-MM-dd'),
            status: $scope.status
        }

        return searchItem;
    }

    function refreshData(data) {

        var data = angular.extend({
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage
        }, $scope.searchItem, data);
        $http.get('/api/orderszj2/agent?' + jQuery.param(data)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }

}]);
