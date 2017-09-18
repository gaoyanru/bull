'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('OrderListCtrl', ['$scope', '$http', '$filter', '$state','$uibModal', function($scope, $http, $filter, $state,$uibModal) {

    var tbOptions = [{
        header: '公司名称',
        col: 'Name',
    },
    //  {
    //     header: '订单编号/合同号',
    //     col: 'OrderId,ContractNO',
    // },
    {
        header: '合同号',
        col: 'ContractNO',
    },
     {
        header: '合同金额',
        col: 'ContractAmount',
    }, {
        header: '状态',
        col: 'Status',
        formate: function(val) {
            var temp = {
                1: "未审核",
                2: "通过",
                3: "拒审"
            }
            return temp[val];
        }
    }, {
        header: '订单日期',
        col: 'CreateDate',
        formate: function(val) {
            return val.substr(0, 10);
        }
    }];
    $scope.rightAlign = [2];

    $scope.headers = getHeaders()



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
    $scope.status=0;

    $scope.setCurrentPage = function(){
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
        $scope.cusname = "";
        $scope.startdate = "";
        $scope.enddate = "";
        $scope.status = 0;
    }

    $scope.searchFn();
    $scope.modify = function(order) {
        if(order.FreChangeOrderId){
            var modalInstance = $uibModal.open({
                templateUrl: 'views/change.html',
                controller: 'Change',
                size: "lg",
                resolve: {
                    orderId: function() {
                        return order.OrderId;
                    },
                    isModify: function(){
                        return true;
                    }
                }
            });
        }else{
            $state.go('^.addOrder', { orderId: order.OrderId });
        }
    };
    $scope.delete = function(orderId) {
        if (confirm('确认删除订单？')) {
            $http({
                method: 'delete',
                url: "/api/orders/" + orderId
            }).success(function(data) {
                if(data.status){
                    alert('删除成功！');
                 }
                 else{
                      // alert(data.message);
                 }
                refreshData();
            });
        }

    }

    $scope.add = function(cusid,ld) {
        $state.go('^.addOrder', { orderId: 'C' + cusid + '&'+ld });
    }

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
        var searchItem = {
            cusname: $scope.cusname,
            start: $filter('date')($scope.startdate, 'yyyy-MM-dd'),
            end: $filter('date')($scope.enddate, 'yyyy-MM-dd'),
            status: $scope.status,
            LegalPerson: $scope.LegalPerson
        }

        return searchItem;
    }

    function refreshData(data) {

        var data = angular.extend({
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage
        }, $scope.searchItem, data);
        $http.get('/api/orders/my?' + jQuery.param(data)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }

}]);
